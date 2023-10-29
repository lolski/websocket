import {ResilientWebsocket} from "./websocket/resilient-websocket";
import { v4 as uuid } from "uuid";
import {Observable, Subject} from "rxjs";

export enum SessionType {
    Anonymous = "Anonymous",
    Authenticated = "Authenticated",
}

export abstract class Session {
    private readonly websocket: ResilientWebsocket
    private readonly responsesCollector: ResponsesCollector

    protected constructor(
        url: string,
        onOpen: () => void,
        onOpenFailure: (e: CloseEvent) => void,
        onClose: (e: CloseEvent) => void
    ) {
        this.websocket = new ResilientWebsocket(
            url,
            onOpen.bind(this),
            onOpenFailure.bind(this),
            this.onMessageReceived.bind(this),
            onClose.bind(this),
        )
        this.responsesCollector = new ResponsesCollector()
    }

    private onMessageReceived(res: string): void {
        let split = res.split("///")
        if (split.length !== 2) throw new Error("x")
        let reqId = split[0]
        let resValue = split[1]
        let isItem = true
        if (isItem) {
            this.onItemResponseReceived(reqId, resValue);
        } else {
            this.onCollectionResponseReceived(reqId, resValue);
        }
    }

    private onItemResponseReceived(reqId: string, resValue: string) {
        let isSuccess = true
        if (isSuccess) {
            this.responsesCollector.itemSuccess(reqId, resValue)
        } else {
            let e = new Error("x")
            this.responsesCollector.itemFailure(reqId, e)
        }
    }

    private onCollectionResponseReceived(reqId: string, resValue: string) {
        let isNotDone = true
        if (isNotDone) {
            this.responsesCollector.collectionNext(reqId, resValue)
        } else {
            let isSuccess = true
            if (isSuccess) {
                this.responsesCollector.collectionSuccess(reqId)
            } else {
                let e = new Error("x")
                this.responsesCollector.collectionFailure(reqId, e)
            }
        }
    }

    public abstract type(): SessionType

    public requestItem(req: string): Promise<string> {
        let reqId = uuid()
        let pendingRes = this.responsesCollector.trackItem(reqId)
        this.websocket.send(reqId + "///" + req)
        return pendingRes
    }

    public requestCollection(req: string): Observable<string> {
        let reqId = uuid()
        let pendingRes = this.responsesCollector.trackCollection(reqId)
        this.websocket.send(reqId + "///" + req)
        return pendingRes
    }

    public url(): string {
        return this.websocket.url()
    }

    public close(): void {
        this.websocket.close()
    }
}

export class AnonymousSession extends Session {
    public constructor(
        url: string,
        onOpen: () => void,
        onReady: () => void,
        onReadyFailure: () => void,
        onOpenFailure: (e: CloseEvent) => void,
        onClose: (e: CloseEvent) => void
    ) {
        let _onOpen = () => {
            onOpen()
            this.requestItem("handshake(type:anonymous)")
                .then(() => onReady())
                .catch(e => {
                    onReadyFailure()
                    this.close()
                })
        };
        super(url, _onOpen, onOpenFailure, onClose);
    }

    public type(): SessionType {
        return SessionType.Anonymous
    }
}

export class AuthenticatedSession extends Session {
    private readonly token: string

    public constructor(
        url: string,
        token: string,
        onOpen: () => void,
        onOpenFailure: (e: CloseEvent) => void,
        onAuthenticated: () => void,
        onAuthenticationFailure: () => void,
        onClose: (e: CloseEvent) => void
    ) {
        let _onOpen = () => {
            onOpen()
            this.requestItem("handshake(type:authenticated, token:" + this.token + ")")
                .then(() => onAuthenticated())
                .catch(e => {
                    onAuthenticationFailure()
                    this.close()
                })
        };
        super(url, _onOpen, onOpenFailure, onClose);
        this.token = token
    }

    public type(): SessionType {
        return SessionType.Authenticated
    }
}

class ResponsesCollector {
    private readonly items: Map<string, PendingItem<string>> = new Map<string, PendingItem<string>>()
    private readonly collections: Map<string, Subject<string>> = new Map<string, Subject<string>>()

    trackItem(reqId: string): Promise<string> {
        let pendingRes = new PendingItem<string>()
        this.items.set(reqId, pendingRes)
        return pendingRes.promise()
    }

    itemSuccess(reqId: string, res: string): void {
        let pending = this.items.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.success(res)
        this.items.delete(reqId)
    }

    itemFailure(reqId: string, e: Error): void {
        let pendingRequest = this.items.get(reqId);
        if (pendingRequest === undefined) throw new Error("x")
        pendingRequest!.failure("rejected")
        this.items.delete(reqId)
    }

    trackCollection(reqId: string): Observable<string> {
        let subject = new Subject<string>()
        this.collections.set(reqId, subject)
        return subject
    }

    collectionNext(reqId: string, value: string) {
        let pending = this.collections.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.next(value)
    }

    collectionSuccess(reqId: string) {
        let pending = this.collections.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.complete()
    }

    collectionFailure(reqId: string, e: Error) {
        let pending = this.collections.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.error(e)
    }
}

class PendingItem<T> {
    private resolve: (value: T) => void = () => {};
    private reject: (value: T) => void = () => {};
    private readonly _promise: Promise<T> = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    })

    public success(value: T) {
        this.resolve(value);
    }

    public failure(value: T) {
        this.reject(value);
    }

    public promise(): Promise<T> {
        return this._promise;
    }
}