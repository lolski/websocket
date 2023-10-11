import { Injectable } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly heartbeatIntervalMs: number = 2000
  private readonly reopenDelayMs: number = 2000

  private port: number

  private websocket: WebSocket
  private heartbeat: Heartbeat | undefined

  constructor(private route: ActivatedRoute) {
    this.port = 8080
    this.websocket = this.wsOpen()
    this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params) {
    this.heartbeatDeactivate();
    this.port = params['port']
    this.reopen(this)
  }

  private wsOpened(connSvc: ConnectionService): void {
    console.log("ConnectionService - opened. readyState = {}", this.readyState(connSvc.websocket))
    if (this.heartbeat !== undefined) throw new Error("assertion error")
    this.heartbeatActivate();
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
    this.heartbeatDeactivate();
    this.scheduleReopen(connSvc)
  }

  private scheduleReopen(connSvc: ConnectionService) {
    setTimeout(() => {
          console.log("timeout, {}", connSvc)
          this.reopen(connSvc);
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

  private wsOpen(): WebSocket {
    let ws = new WebSocket(this.url())
    console.log("ConnectionService - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onmessage = this.createWsOnMessage((res: string): void => { console.log("default receiver: received ", res)})
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt)
    console.log("ConnectionService - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private reopen(connSvc: ConnectionService) {
    let wsOnMsg = connSvc.websocket.onmessage
    connSvc.websocket = connSvc.wsOpen()
    connSvc.websocket.onmessage = wsOnMsg
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

  public setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.onmessage = this.createWsOnMessage(responseReceiver)
  }

  private heartbeatActivate() {
    this.heartbeat = new Heartbeat(this.websocket, this.heartbeatIntervalMs)
  }

  private heartbeatDeactivate() {
    if (this.heartbeat !== undefined) {
      let hb = this.heartbeat!
      if (!hb.isActive()) throw new Error("assertion error")
      hb.deactivate()
      this.heartbeat = undefined
    }
  }

  private url(): string {
    let url = "ws://localhost:" + this.port + "/connection";
    console.log("url = ", url)
    return url
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