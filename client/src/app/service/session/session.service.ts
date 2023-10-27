import {Injectable} from '@angular/core';
import {AnonymousSession, AuthenticatedSession, Session, SessionType} from "./session";
import {Observable} from "rxjs";

@Injectable()
export class SessionService {
  private session: Session | undefined

  public anonymous(url: string): void {
    if (this.isOpen()) {
      if (this.session!.type() !== SessionType.Anonymous) {
        this.close()
        this.openAnonymous(url)
      } else {
        // do nothing
      }
    } else {
      this.openAnonymous(url)
    }
  }

  private openAnonymous(url: string): void {
    if (this.session !== undefined) throw new Error("x")
    this.session = new AnonymousSession(url)
  }

  public authenticated(url: string, token: string): void {
    if (this.isOpen()) {
      if (this.session!.type() !== SessionType.Authenticated) {
        this.close()
        this.openAuthenticated(url, token)
      } else {
        // do nothing
      }
    } else {
      this.openAuthenticated(url, token)
    }
  }

  private openAuthenticated(url: string, token: string): void {
    if (this.session !== undefined) throw new Error("x")
    this.session = new AuthenticatedSession(url, token)
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