import { Injectable } from '@angular/core';
import { Session } from "./session";
import { Observable } from "rxjs";

@Injectable()
export class SessionService {
  private session: Session | undefined

  public open(url: string): Promise<void> {
    if (this.session !== undefined) throw new Error("x")
    this.session = new Session(url)
    return Promise.resolve()
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
  }
}
