import { Component, OnInit } from '@angular/core';
import {ConnectionService} from "./service/connection.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private connSvc: ConnectionService

  response: { request: string; response: string } | undefined

  constructor(connSvc: ConnectionService) {
    this.connSvc = connSvc
  }

  ngOnInit(): void {
    console.log("setting response receiver")
    this.connSvc.setResponseReceiver(this.receiveResponse.bind(this))
  }

  receiveResponse(res: string): void {
    this.response = { request: res, response: "response to '" + res + "'" }
  }

  receiveRequest(value: string): void {
    this.connSvc.sendRequest(value)
  }
}
