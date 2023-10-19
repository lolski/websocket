import { Component, OnInit } from '@angular/core';
import { SessionService } from "./service/session/session.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private connSvc: SessionService

  response: { request: string; response: string } | undefined

  constructor(connSvc: SessionService) {
    this.connSvc = connSvc
  }

  ngOnInit(): void {
    this.connSvc.setResponseReceiver(this.receiveResponse.bind(this))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }

  receiveRequest(value: string): void {
    this.connSvc.send(value)
  }
}
