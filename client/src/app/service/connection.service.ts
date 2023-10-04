import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private url: string = "ws://localhost:8080/connection"
  private reopenDelayMs: number = 2000

  private websocket: WebSocket

  constructor() {
    this.websocket = this.open()
  }

  private open(): WebSocket {
    let ws = new WebSocket(this.url)
    console.log("ConnectionService - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.onOpen(this)
    ws.onerror = (error: any) => this.onError(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.onClose(this, closeEvt)
    console.log("ConnectionService - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private onOpen(connSvc: ConnectionService): void {
    console.log("ConnectionService - opened. readyState = {}", this.readyState(connSvc.websocket))
  }

  private onError(connSvc: ConnectionService, error: any): void {
    console.log("ConnectionService - errored. readyState = {}", this.readyState(connSvc.websocket))
  }

  private onClose(connSvc: ConnectionService, closeEvt: CloseEvent): void {
    console.log("ConnectionService - closed. readyState = {}, closeEvt = {}", this.readyState(this.websocket), closeEvt)
    if (closeEvt.wasClean) throw new Error("unexpected")
    setTimeout(() => {
          console.log("timeout, {}", connSvc)
          connSvc.websocket = connSvc.open()
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
        throw new Error("The value of readyState is invalid")
    }
  }
}
