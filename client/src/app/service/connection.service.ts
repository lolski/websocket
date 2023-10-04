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
    console.log("ConnectionService - open started")

    let ws = new WebSocket(this.url)
    ws.onopen = () => this.onOpen(this)
    ws.onerror = (error: any) => this.onError(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.onClose(this, closeEvt)
    console.log("ConnectionService - open ended")
    return ws
  }

  private close(ws: WebSocket): void {
    this.websocket.close()
  }

  private onOpen(connSvc: ConnectionService): void {
    console.log("ConnectionService - opened {}", connSvc)
  }

  private onError(connSvc: ConnectionService, error: any): void {
    console.log("ConnectionService - errored")
  }

  private onClose(connSvc: ConnectionService, closeEvt: CloseEvent): void {
    console.log("ConnectionService - closed")
    this.close(this.websocket)
    setTimeout(() => {
          console.log("timeout, {}", connSvc)
          connSvc.websocket = connSvc.open()
        },
        this.reopenDelayMs
    )
  }
}
