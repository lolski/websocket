import { Injectable } from '@angular/core';
import {Session} from "./session";
import {Observable} from "rxjs";

@Injectable()
export class SessionService {
  private session: Session | undefined

  public newAnonymous(port: number, ): Promise<void> {
    if (this.session !== undefined) throw new Error("x")
    this.session = new Session(this.url(port))
    return Promise.resolve()
  }

  private url(port: number): string {
    return "ws://localhost:" + port + "/session"
  }

  public requestItem(req: string): Promise<string> {
    if (this.session === undefined) throw new Error("x")
    return this.session.requestItem(req)
  }

  public requestCollection(req: string): Observable<string> {
    if (this.session === undefined) throw new Error("x")
    return this.session.requestCollection(req)
  }
}
