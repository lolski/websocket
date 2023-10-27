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
    this.sessionSvc.authenticated(this.url(8081), "token")
    this.portChangeEvents = this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    let port = params['port'];
    if (port !== undefined) {
      if (this.sessionSvc.url() !== this.url(port)) {
        this.sessionSvc.authenticated(this.url(port), "token")
      }
    }
  }

  private url(port: number) {
    return "ws://localhost:" + port + "/session";
  }

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}