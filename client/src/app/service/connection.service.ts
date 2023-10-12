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
        this.url(8080),
        (res: string): void => { console.log("default receiver: received ", res) }
    )
    this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      console.log("a")
      let port = params['port']
      this.websocket.close()
      this.websocket = new ResilientWebsocket(this.url(port), this.websocket.getMessageReceiver())
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

  private currentMsgReceiver: MessageReceiver
  private websocket: KeepAliveWebsocket

  constructor(url: string, messageReceiver: MessageReceiver) {
    this.currentMsgReceiver = messageReceiver
    let rws = this
    this.websocket = this.createWebsocket(url, rws)
  }

  private scheduleRecreate(rws: ResilientWebsocket): void {
    setTimeout(
        () => {
          this.websocket = rws.createWebsocket(rws.websocket.url(), rws)
        },
        this.recreateDelayMs)
  }

  private createWebsocket(url: string, rws: ResilientWebsocket): KeepAliveWebsocket {
    return new KeepAliveWebsocket(
        url,
        rws.keepAliveIntervalMs,
        rws.currentMsgReceiver,
        (_: CloseEvent) => rws.scheduleRecreate(rws)
    );
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
    this.websocket.close()
  }
}

class KeepAliveWebsocket {
  private wasOpened: boolean
  private readonly websocket: WebSocket
  private readonly keepAliveScheduler: KeepAliveScheduler

  constructor(url: string, keepAliveMs: number, messageReceiver: MessageReceiver, onClose: (closeEvt: CloseEvent) => void) {
    this.wasOpened = false
    this.websocket = this.createWebsocket(url, messageReceiver, onClose)
    this.keepAliveScheduler = new KeepAliveScheduler(this.websocket, keepAliveMs)
  }

  private createWebsocket(url: string, messageReceiver: MessageReceiver, onClose: (closeEvt: CloseEvent) => void): WebSocket {
    let ws = new WebSocket(url)
    console.log("KeepAliveWebsocket - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onmessage = this.createWsOnMessage(messageReceiver)
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt, onClose)
    console.log("KeepAliveWebsocket - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private wsOpened(connSvc: KeepAliveWebsocket): void {
    this.wasOpened = true
    console.log("KeepAliveWebsocket - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.keepAliveScheduler.isActive()) throw new Error("assertion error")
    this.keepAliveScheduler.activate()
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

  send(message: string): void {
    this.websocket.send(message)
  }

  url(): string {
    return this.websocket.url;
  }

  close(): void {
    this.websocket.close()
  }

  private wsErrored(connSvc: KeepAliveWebsocket, error: any): void {
    console.log("KeepAliveWebsocket - errored. readyState = {}", this.readyState(connSvc.websocket))
  }

  private wsClosed(connSvc: KeepAliveWebsocket, closeEvt: CloseEvent, onClose: (closeEvt: CloseEvent) => void): void {
    console.log("KeepAliveWebsocket - closed. readyState = {}", this.readyState(connSvc.websocket))
    if (this.wasOpened) {
      this.keepAliveScheduler.deactivate()
    }
    onClose(closeEvt)
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
          console.log("ping")
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
