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
    ws.onopen = this.onOpen
    ws.onerror = this.onError
    ws.onclose = this.onClose
    console.log("ConnectionService - open ended")
    return ws
  }

  private close(ws: WebSocket): void {
    ws.onopen = (): void => {}
    ws.onerror = (error: any): void => {}
    ws.onclose = (close: CloseEvent): void => {}
    this.websocket.close()
  }

  private onOpen(): void {
    console.log("ConnectionService - opened")
  }

  private onError(error: any): void {
    console.log("ConnectionService - errored")
  }

  private onClose(close: CloseEvent): void {
    console.log("ConnectionService - closed")
    this.close(this.websocket)
    let this_ = this
    setTimeout(() => { this_.websocket = this_.open() }, this.reopenDelayMs)
  }
}
