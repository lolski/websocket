import { Injectable } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {ResilientWebsocket} from "./websocket/resilient-websocket";

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class SessionService {
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
