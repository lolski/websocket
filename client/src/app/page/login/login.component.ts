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
  private sessionSvc: SessionService
  private portChangeEvents: Subscription

  constructor(sessionSvc: SessionService, route: ActivatedRoute) {
    this.sessionSvc = sessionSvc
    this.portChangeEvents = route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      this.switchSession("ws://localhost:" + params['port'] + "/session")
    }
  }

  private switchSession(url: string) {
  }

  ngOnInit(): void {
    if (!this.sessionSvc.isOpen()) {
      this.sessionSvc.open("ws://localhost:1024/session")
    }
  }

  ngOnDestroy(): void {
    console.debug("ngOnDestroy")
    this.portChangeEvents.unsubscribe()
  }
}
