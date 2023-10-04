import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly url: string = "ws://localhost:8080/connection"
  private readonly heartbeatIntervalMs: number = 2000
  private readonly reopenDelayMs: number = 2000

  private websocket: WebSocket
  private heartbeat: Heartbeat

  constructor() {
    [this.websocket, this.heartbeat] = this.open()
  }

  private open(): [WebSocket, Heartbeat] {
    let ws = new WebSocket(this.url)
    console.log("ConnectionService - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt)
    let hb = new Heartbeat(this.websocket, this.heartbeatIntervalMs)
    console.log("ConnectionService - open ended. readyState = {}", this.readyState(ws))
    return [ws, hb]
  }

  private wsOpened(connSvc: ConnectionService): void {
    console.log("ConnectionService - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.heartbeat.isActive()) throw new Error("assertion error")
    this.heartbeat.activate()
  }

  private wsErrored(connSvc: ConnectionService, error: any): void {
    console.log("ConnectionService - errored. readyState = {}", this.readyState(connSvc.websocket))
  }

  private wsClosed(connSvc: ConnectionService, closeEvt: CloseEvent): void {
    console.log("ConnectionService - closed. readyState = {}", this.readyState(connSvc.websocket))
    if (closeEvt.wasClean) throw new Error("assertion error")
    if (this.heartbeat.isActive()) this.heartbeat.deactivate()
    this.scheduleReopen(connSvc)
  }

  private scheduleReopen(connSvc: ConnectionService) {
    setTimeout(() => {
          console.log("timeout, {}", connSvc)
          let [ws, hb] = connSvc.open()
          connSvc.websocket = ws
          connSvc.heartbeat = hb
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

  public send(data: string) {
    this.websocket.send(data)
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