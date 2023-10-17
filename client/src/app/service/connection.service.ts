import { Injectable } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private websocket: ResilientWebsocket

  constructor(private route: ActivatedRoute) {
    this.websocket = new ResilientWebsocket(
        this.url(1024),
        () => { console.log("opened") },
        (e) => { console.log("unable to open") },
        (res: string): void => { console.log("default receiver: received ", res) },
        (e) => { console.log("closed") },
    )
    this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      let port = params['port']
      this.websocket.close()
      this.websocket = new ResilientWebsocket(
          this.url(port),
          () => { console.log("opened") },
          (e) => { console.log("unable to open") },
          this.websocket.getMessageReceiver(),
          (e) => { console.log("closed") },
      )
    }
  }

  private url(port: number): string {
    return "ws://localhost:" + port + "/connection"
  }

  public setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.setMessageReceiver(responseReceiver)
  }

  public send(req: string): void {
    this.websocket.send(req)
  }
}

type MessageReceiver = (res: string) => void

class ResilientWebsocket {
  private readonly keepAliveIntervalMs: number = 2000
  private readonly recreateDelayMs: number = 2000

  private readonly onOpen: () => void
  private readonly onOpenFailure: (e: CloseEvent) => void
  private currentMsgReceiver: MessageReceiver
  private readonly onClose: (e: CloseEvent) => void
  private websocket: KeepAliveWebsocket
  private shouldRecreate: boolean

  constructor(
      url: string,
      onOpen: () => void,
      onOpenFailure: (e: CloseEvent) => void,
      messageReceiver: MessageReceiver,
      onClose: (e: CloseEvent) => void,
  ) {
    this.onOpen = onOpen
    this.onOpenFailure = onOpenFailure
    this.currentMsgReceiver = messageReceiver
    this.onClose = onClose
    this.websocket = this.createWebsocket(url, this)
    this.shouldRecreate = true
  }

  private createWebsocket(url: string, rws: ResilientWebsocket): KeepAliveWebsocket {
    return new KeepAliveWebsocket(
        url,
        rws.keepAliveIntervalMs,
        rws.onOpen,
        rws.onOpenFailure,
        rws.currentMsgReceiver,
        (e: CloseEvent): void => {
          rws.onClose(e)
          if (rws.shouldRecreate) {
            rws.scheduleRecreate(rws)
          }
        }
    );
  }

  private scheduleRecreate(rws: ResilientWebsocket): void {
    setTimeout(
        () => {
          this.websocket = rws.createWebsocket(rws.websocket.url(), rws)
        },
        this.recreateDelayMs)
  }

  setMessageReceiver(messageReceiver: MessageReceiver): void {
    this.currentMsgReceiver = messageReceiver
    this.websocket.setMessageReceiver(messageReceiver)
  }

  getMessageReceiver(): MessageReceiver {
    return this.currentMsgReceiver
  }

  send(message: string): void {
    this.websocket.send(message)
  }

  close(): void {
    this.shouldRecreate = false
    this.websocket.close()
  }
}

class KeepAliveWebsocket {
  private opened: boolean
  private readonly websocket: WebSocket
  private readonly keepAliveScheduler: KeepAliveScheduler

  constructor(
      url: string,
      keepAliveMs: number,
      onOpen: () => void,
      onOpenFailure: (closeEvt: CloseEvent) => void,
      messageReceiver: MessageReceiver,
      onClose: (closeEvt: CloseEvent) => void
  ) {
    this.opened = false
    this.websocket = this.createWebsocket(url, messageReceiver, onOpen, onOpenFailure, onClose)
    this.keepAliveScheduler = new KeepAliveScheduler(this.websocket, keepAliveMs)
  }

  private createWebsocket(url: string,
                          messageReceiver: MessageReceiver,
                          onOpen: () => void,
                          onOpenFailure: (closeEvt: CloseEvent) => void,
                          onClose: (closeEvt: CloseEvent) => void
  ): WebSocket {
    let ws = new WebSocket(url)
    console.debug("KeepAliveWebsocket - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this, onOpen)
    ws.onmessage = this.createWsOnMessage(messageReceiver)
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt, onOpenFailure, onClose)
    console.debug("KeepAliveWebsocket - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private wsOpened(connSvc: KeepAliveWebsocket, onOpen: () => void): void {
    this.opened = true
    console.debug("KeepAliveWebsocket - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.keepAliveScheduler.isActive()) throw new Error("assertion error")
    this.keepAliveScheduler.activate()
    onOpen()
  }

  public setMessageReceiver(messageReceiver: MessageReceiver): void {
    this.websocket.onmessage = this.createWsOnMessage(messageReceiver)
  }

  private createWsOnMessage(messageReceiver: MessageReceiver) {
    return (msgEvt: MessageEvent): void => {
      if (msgEvt.data === "response for 'ping'") return
      messageReceiver(msgEvt.data)
    };
  }

  private wsErrored(connSvc: KeepAliveWebsocket, error: any): void {
    console.debug("KeepAliveWebsocket - errored. readyState = {}", this.readyState(connSvc.websocket))
  }

  private wsClosed(connSvc: KeepAliveWebsocket, closeEvt: CloseEvent, onOpenFailure: (closeEvt: CloseEvent) => void, onClose: (closeEvt: CloseEvent) => void): void {
    console.debug("KeepAliveWebsocket - closed. readyState = {}", this.readyState(connSvc.websocket))
    if (this.opened) {
      this.keepAliveScheduler.deactivate()
      onClose(closeEvt)
    } else {
      onOpenFailure(closeEvt)
    }
  }

  private readyState(ws: WebSocket): string {
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING"
      case WebSocket.OPEN:
        return "OPEN"
      case WebSocket.CLOSING:
        return "CLOSING"
      case WebSocket.CLOSED:
        return "CLOSED"
      default:
        throw new Error("assertion error")
    }
  }

  url(): string {
    return this.websocket.url;
  }

  send(message: string): void {
    this.websocket.send(message)
  }

  close(): void {
    this.websocket.close()
  }
}

class KeepAliveScheduler {
  private readonly intervalMs: number
  private schedulerId: number | undefined
  private readonly websocket: WebSocket

  constructor(ws: WebSocket, intervalMs: number) {
    this.websocket = ws
    this.intervalMs = intervalMs
  }

  isActive(): boolean {
    return this.schedulerId !== undefined;
  }

  activate(): void {
    if (this.schedulerId !== undefined) throw new Error("scheduler already activated")

    this.schedulerId = setInterval(
        () => {
          console.trace("KeepAliveScheduler - ping")
          this.websocket.send("ping")
        },
        this.intervalMs
    )
  }

  deactivate(): void {
    if (this.schedulerId === undefined) throw new Error("scheduler already deactivated")

    clearInterval(this.schedulerId)
    this.schedulerId = undefined
  }
}
