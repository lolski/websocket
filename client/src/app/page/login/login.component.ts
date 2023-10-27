import {Component, OnDestroy, OnInit} from '@angular/core';
import {SessionService} from "../../service/session/session.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute
  private readonly sessionSvc: SessionService
  private portChangeEvents: Subscription | undefined

  constructor(route: ActivatedRoute, sessionSvc: SessionService) {
    this.route = route
    this.sessionSvc = sessionSvc
  }

  ngOnInit(): void {
    if (!this.sessionSvc.isOpen()) {
      this.sessionSvc.open("ws://localhost:1024/session")
    }
    this.portChangeEvents = this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    let port = params['port'];
    if (port !== undefined) {
      if (this.sessionSvc.url() !== this.url(port)) {
        this.switchSession(this.url(port))
      }
    }
  }

  private url(port: number) {
    return "ws://localhost:" + port + "/session";
  }

  private switchSession(url: string) {
    console.log("switchSession to " + url)
    this.sessionSvc.close()
    this.sessionSvc.open(url)
  }

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}
