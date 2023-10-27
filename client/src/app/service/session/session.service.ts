import { Injectable } from '@angular/core';
import { Session } from "./session";
import { Observable } from "rxjs";

@Injectable()
export class SessionService {
  private session: Session | undefined

  public anonymous(url: string): Promise<void> {
    if (this.isOpen()) {
      this.close()
    }
    return this.openAnonymous(url)
  }

  private openAnonymous(url: string) {
    if (this.session !== undefined) throw new Error("x")
    return Session.anonymous(url)
        .then(session => {
          this.session = session
        });
  }

  public isOpen(): boolean {
    return this.session !== undefined
  }

  public requestItem(req: string): Promise<string> {
    if (this.session === undefined) throw new Error("x")
    return this.session.requestItem(req)
  }

  public requestCollection(req: string): Observable<string> {
    if (this.session === undefined) throw new Error("x")
    return this.session.requestCollection(req)
  }

  public url(): string | undefined {
    return this.session?.url()
  }

  public close(): void {
    if (this.session === undefined) throw new Error("x")
    this.session.close()
    this.session = undefined
  }
}