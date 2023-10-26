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
  private sessionSvc: SessionService
  private portChangeEvents: Subscription

  response: { request: string; response: string } | undefined

  constructor(sessionSvc: SessionService, route: ActivatedRoute) {
    this.sessionSvc = sessionSvc
    this.portChangeEvents = route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      let port = params['port']
      // reconnect
      console.debug("chatroom: port updated to " + port)
    }
  }

  ngOnInit(): void {
    // connect
  }

  receiveRequest(value: string): void {
    this.sessionSvc.requestCollection(value).subscribe((res) => this.receiveResponse(res))
    // this.sessionSvc.requestItem(value).then((res) => this.receiveResponse(res))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }

  ngOnDestroy(): void {
    console.debug("ngOnDestroy")
    this.portChangeEvents.unsubscribe()
  }
}
