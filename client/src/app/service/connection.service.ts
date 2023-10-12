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
      let port = params['port']
      this.websocket.close()
      this.websocket = new ResilientWebsocket(this.url(port), this.websocket.getResponseReceiver())
    }
  }

  private url(port: number): string {
    return "ws://localhost:" + port + "/connection"
  }

  public setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.setResponseReceiver(responseReceiver)
  }

  public send(req: string): void {
    this.websocket.send(req)
  }
}

class ResilientWebsocket {
  private readonly keepAliveIntervalMs: number = 2000
  private readonly reopenDelayMs: number = 2000

  private currentResReceiver: ResponseReceiver
  private websocket: KeepAliveWebsocket

  constructor(url: string, responseReceiver: ResponseReceiver) {
    this.currentResReceiver = responseReceiver
    let rws = this
    this.websocket = this.createWebsocket(url, rws)
  }

  private scheduleReopen(rws: ResilientWebsocket): void {
    setTimeout(
        () => {
          this.websocket = rws.createWebsocket(rws.websocket.url(), rws)
        },
        this.reopenDelayMs)
  }

  private createWebsocket(url: string, rws: ResilientWebsocket): KeepAliveWebsocket {
    return new KeepAliveWebsocket(
        url,
        rws.keepAliveIntervalMs,
        rws.currentResReceiver,
        (_: CloseEvent) => rws.scheduleReopen(rws)
    );
  }

  setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.setResponseReceiver(responseReceiver)
  }

  getResponseReceiver(): ResponseReceiver {
    return this.currentResReceiver
  }

  send(message: string): void {
    this.websocket.send(message)
  }

  close(): void {
    this.websocket.close()
  }
}

class KeepAliveWebsocket {
  private opened: boolean
  private readonly websocket: WebSocket
  private readonly heartbeat: KeepAliveScheduler


  constructor(url: string, keepAliveMs: number, responseReceiver: ResponseReceiver, onClose: (closeEvt: CloseEvent) => void) {
    this.opened = false
    this.websocket = this.createWebsocket(url, responseReceiver, onClose)
    this.heartbeat = new KeepAliveScheduler(this.websocket, keepAliveMs)
  }

  private createWebsocket(url: string, responseReceiver: ResponseReceiver, onClose: (closeEvt: CloseEvent) => void): WebSocket {
    let ws = new WebSocket(url)
    console.log("KeepAliveWebsocket - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onmessage = this.createWsOnMessage(responseReceiver)
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt, onClose)
    console.log("KeepAliveWebsocket - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private wsOpened(connSvc: KeepAliveWebsocket): void {
    this.opened = true
    console.log("KeepAliveWebsocket - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.heartbeat.isActive()) throw new Error("assertion error")
    this.heartbeat.activate()
  }

  public setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.onmessage = this.createWsOnMessage(responseReceiver)
  }

  private createWsOnMessage(responseReceiver: ResponseReceiver) {
    return (msgEvt: MessageEvent): void => {
      if (msgEvt.data === "response for 'ping'") return
      responseReceiver(msgEvt.data)
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
    if (this.opened) {
      this.heartbeat.deactivate()
      onClose(closeEvt)
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
}

class KeepAliveScheduler {
  private readonly intervalMs: number
  private schedulerId: number | undefined
  private readonly websocket: WebSocket

  constructor(ws: WebSocket, intervalMs: number) {
    this.websocket = ws
    this.intervalMs = intervalMs
  }

  isActive() {
    return this.schedulerId !== undefined;
  }

  activate() {
    if (this.schedulerId !== undefined) throw new Error("assertion error")

    this.schedulerId = setInterval(
        () => {
          console.log("ping")
          this.websocket.send("ping")
        },
        this.intervalMs
    )
  }

  deactivate() {
    if (this.schedulerId === undefined) throw new Error("assertion error")

    clearInterval(this.schedulerId)
    this.schedulerId = undefined
  }
}
