import { Injectable } from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";
import {Session} from "./session";

type ResponseReceiver = (res: string) => void

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private session: Session

  constructor(private route: ActivatedRoute) {
    this.session = new Session(this.url(1024))
    this.route.queryParams.subscribe(params => {
      this.queryParamsUpdated(params);
    })
  }

  private queryParamsUpdated(params: Params): void {
    if (params['port'] !== undefined) {
      let port = params['port']
      this.session.close()
      this.session = new Session(this.url(port))
    }
  }

  private url(port: number): string {
    return "ws://localhost:" + port + "/connection"
  }

  public send(req: string): Promise<string> {
    return this.session.requestItem(req)
  }
}
