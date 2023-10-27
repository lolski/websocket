import {Component, OnDestroy, OnInit} from '@angular/core';
import {SessionManagerService} from "../../service/session/session.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute
  private readonly sessionMgrSvc: SessionManagerService
  private portChangeEvents: Subscription | undefined

  response: { request: string; response: string } | undefined

  constructor(route: ActivatedRoute, sessionMgrSvc: SessionManagerService) {
    this.route = route
    this.sessionMgrSvc = sessionMgrSvc
  }

  ngOnInit(): void {
    this.sessionMgrSvc.authenticated(this.url(8081), "token")
    this.portChangeEvents = this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    let port = params['port'];
    if (port !== undefined) {
      if (this.sessionMgrSvc.url() !== this.url(port)) {
        this.sessionMgrSvc.authenticated(this.url(port), "token")
      }
    }
  }

  private url(port: number) {
    return "ws://localhost:" + port + "/session";
  }

  receiveRequest(value: string): void {
    // this.sessionMgrSvc.requestCollection(value).subscribe((res) => this.receiveResponse(res))
    this.sessionMgrSvc.requestItem(value).then((res) => this.receiveResponse(res))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}
