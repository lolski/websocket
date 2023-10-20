import { Component } from '@angular/core';
import { SessionService } from "./service/session/session.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private sessionSvc: SessionService

  response: { request: string; response: string } | undefined

  constructor(sessionSvc: SessionService) {
    this.sessionSvc = sessionSvc
  }

  receiveRequest(value: string): void {
    this.sessionSvc.requestCollection(value).subscribe((res) => this.receiveResponse(res))
    // this.sessionSvc.requestItem(value).then((res) => this.receiveResponse(res))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }
}
