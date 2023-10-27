import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {SessionService} from "../../service/session/session.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute
  private readonly sessionSvc: SessionService
  private portChangeEvents: Subscription | undefined

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
    console.log("switchSession to " + url)
    this.sessionSvc.close()
    this.sessionSvc.anonymous(url)
  }

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}