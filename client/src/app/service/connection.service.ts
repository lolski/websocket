import { Injectable } from '@angular/core';

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly url: string = "ws://localhost:8080/connection"
  private readonly heartbeatIntervalMs: number = 2000
  private readonly reopenDelayMs: number = 2000

  private websocket: WebSocket
  private heartbeat: Heartbeat | undefined

  constructor() {
    this.websocket = this.wsOpen()
  }

  private wsOpen(): WebSocket {
    let ws = new WebSocket(this.url)
    console.log("ConnectionService - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onmessage = this.createWsOnMessage((res: string): void => { console.log("default receiver: received ", res)})
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt)
    console.log("ConnectionService - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private wsOpened(connSvc: ConnectionService): void {
    console.log("ConnectionService - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.heartbeat === undefined) {
      this.heartbeat = new Heartbeat(this.websocket, this.heartbeatIntervalMs)
    }
    let hb = this.heartbeat!
    if (hb.isActive()) throw new Error("assertion error")
    hb.activate()
  }

  private wsErrored(connSvc: ConnectionService, error: any): void {
    console.log("ConnectionService - errored. readyState = {}", this.readyState(connSvc.websocket))
  }

  private wsClosed(connSvc: ConnectionService, closeEvt: CloseEvent): void {
    console.log("ConnectionService - closed. readyState = {}", this.readyState(connSvc.websocket))
    if (closeEvt.wasClean) throw new Error("assertion error")
    if (this.heartbeat !== undefined) {
      let hb = this.heartbeat!
      if (!hb.isActive()) throw new Error("assertion error")
      hb.deactivate()
      this.heartbeat = undefined
    }
    this.scheduleReopen(connSvc)
  }

  private scheduleReopen(connSvc: ConnectionService) {
    setTimeout(() => {
          console.log("timeout, {}", connSvc)
          let wsOnMsg = connSvc.websocket.onmessage
          connSvc.websocket = connSvc.wsOpen()
          connSvc.websocket.onmessage = wsOnMsg
        },
        this.reopenDelayMs
    )
  }

  private readyState(ws: WebSocket): string {
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        throw new Error("assertion error")
    }
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

  public sendRequest(req: string): void {
    this.websocket.send(req)
  }
}

class Heartbeat {
  private readonly intervalMs: number
  private intervalId: number | undefined
  private readonly websocket: WebSocket

  constructor(ws: WebSocket, intervalMs: number) {
    this.websocket = ws
    this.intervalMs = intervalMs
  }

  isActive() {
    return this.intervalId !== undefined;
  }

  activate() {
    if (this.intervalId !== undefined) throw new Error("assertion error")

    this.intervalId = setInterval(
        () => {
          console.log("ping")
          this.websocket.send("ping")
        },
        this.intervalMs
    )
  }

  deactivate() {
    if (this.intervalId === undefined) throw new Error("assertion error")

    clearInterval(this.intervalId)
    this.intervalId = undefined
  }
}