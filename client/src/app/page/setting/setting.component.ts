import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {SessionManagerService} from "../../service/session/session.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  private readonly route: ActivatedRoute
  private readonly sessionMgrSvc: SessionManagerService
  private portChangeEvents: Subscription | undefined

  constructor(route: ActivatedRoute, sessionSvc: SessionManagerService) {
    this.route = route
    this.sessionMgrSvc = sessionSvc
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

  ngOnDestroy(): void {
    if (this.portChangeEvents === undefined) throw new Error("x")
    this.portChangeEvents!.unsubscribe()
  }
}