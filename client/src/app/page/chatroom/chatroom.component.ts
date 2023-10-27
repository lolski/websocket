import {Component, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from "../../service/session/session.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute
  private readonly sessionSvc: SessionService
  private portChangeEvents: Subscription | undefined

  response: { request: string; response: string } | undefined

  constructor(route: ActivatedRoute, sessionSvc: SessionService) {
    this.route = route
    this.sessionSvc = sessionSvc
  }

  ngOnInit(): void {
    this.sessionSvc.anonymous(this.url(8081))
    this.portChangeEvents = this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    let port = params['port'];
    if (port !== undefined) {
      if (this.sessionSvc.url() !== this.url(port)) {
        this.sessionSvc.anonymous(this.url(port))
      }
    }
  }

  private url(port: number) {
    return "ws://localhost:" + port + "/session";
  }

  private switchSession(url: string) {
    this.sessionSvc.close()
    this.sessionSvc.anonymous(url)
  }

  receiveRequest(value: string): void {
    this.sessionSvc.requestCollection(value).subscribe((res) => this.receiveResponse(res))
    // this.sessionSvc.requestItem(value).then((res) => this.receiveResponse(res))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}
