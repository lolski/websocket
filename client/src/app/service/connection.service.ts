import { Injectable } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private websocket: ResilientWebsocket

  constructor(private route: ActivatedRoute) {
    this.websocket = new ResilientWebsocket(this.url(8080))
    this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      let port = params['port']
      this.websocket.close()
      this.websocket = this.websocket.clone(this.url(port))
    }
  }

  private url(port: number): string {
    return "ws://localhost:" + port + "/connection";
  }

  public sendRequest(req: string): void {
    this.websocket.send(req)
  }

  public setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.setResponseReceiver(responseReceiver)
  }
}

class ResilientWebsocket {
  private readonly keepAliveIntervalMs: number = 2000
  private readonly reopenDelayMs: number = 2000

  private websocket: KeepAliveWebsocket

  constructor(url: string) {
    this.websocket = new KeepAliveWebsocket(url, this.keepAliveIntervalMs)
  }

  clone(url: string | undefined): ResilientWebsocket {
    let rws = new ResilientWebsocket(url !== undefined ? url : this.websocket.url());
    // TODO: clone onmessage
    return rws;
  }

  // TODO: reconnecting logic
  private scheduleReopen(rws: ResilientWebsocket): void {
    setTimeout(() => {
          this.websocket = this.websocket.clone(undefined)
        },
        this.reopenDelayMs
    )
  }

  setResponseReceiver(responseReceiver: ResponseReceiver): void {
    this.websocket.setResponseReceiver(responseReceiver)
  }

  send(message: string): void {
    this.websocket.send(message)
  }

  close(): void {
    this.websocket.close()
  }
}

class KeepAliveWebsocket {
  private readonly websocket: WebSocket
  private readonly heartbeat: KeepAliveScheduler

  constructor(url: string, keepAliveMs: number) {
    this.websocket = this.createWebsocket(url)
    this.heartbeat = new KeepAliveScheduler(this.websocket, keepAliveMs)
  }

  clone(url: string | undefined): KeepAliveWebsocket {
    let kaws = new KeepAliveWebsocket(
        url !== undefined ? url : this.websocket.url,
        this.heartbeat.getIntervalMs()
    )
    kaws.websocket.onopen = this.websocket.onopen
    kaws.websocket.onmessage = this.websocket.onmessage
    kaws.websocket.onerror = this.websocket.onerror
    kaws.websocket.onclose = this.websocket.onclose
    return kaws;
  }

  private createWebsocket(url: string): WebSocket {
    let ws = new WebSocket(url)
    console.log("KeepAliveWebsocket - open started. readyState = {}", this.readyState(ws))
    ws.onopen = () => this.wsOpened(this)
    ws.onmessage = this.createWsOnMessage((res: string): void => { console.log("default receiver: received ", res)})
    ws.onerror = (error: any) => this.wsErrored(this, error)
    ws.onclose = (closeEvt: CloseEvent) => this.wsClosed(this, closeEvt)
    console.log("KeepAliveWebsocket - open ended. readyState = {}", this.readyState(ws))
    return ws
  }

  private wsOpened(connSvc: KeepAliveWebsocket): void {
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

  private wsClosed(connSvc: KeepAliveWebsocket, closeEvt: CloseEvent): void {
    console.log("KeepAliveWebsocket - closed. readyState = {}", this.readyState(connSvc.websocket))
    this.heartbeat.deactivate()
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

  getIntervalMs() {
    return this.intervalMs
  }
}