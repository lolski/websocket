import {ResilientWebsocket} from "./websocket/resilient-websocket";
import { v4 as uuid } from "uuid";
import {Observable} from "rxjs";

export class Session {
    private readonly websocket: ResilientWebsocket
    private readonly responsesCollector: ResponsesCollector

    constructor(url: string) {
        this.websocket = new ResilientWebsocket(
            url,
            () => { console.log("onOpen") },
            () => { console.log("onOpenFailure") },
            this.onMessageReceived.bind(this),
            () => { console.debug("onClose") },
        )
        this.responsesCollector = new ResponsesCollector()
    }

    private onMessageReceived(res: string): void {
        let split = res.split("///")
        if (split.length !== 2) throw new Error("x")
        let reqId = split[0]
        let resValue = split[1]
        this.responsesCollector.itemSuccess(reqId, resValue)
    }

    public requestItem(req: string): Promise<string> {
        let reqId = uuid()
        let pendingRes = this.responsesCollector.trackItem(reqId)
        this.websocket.send(reqId + "///" + req)
        return pendingRes
    }

    public requestCollection(req: string): Observable<string> {
        throw new Error("TODO")
    }

    public close(): void {
        this.websocket.close()
    }
}

class ResponsesCollector {
    private itemCollectors: Map<string, PendingItem<string>> = new Map<string, PendingItem<string>>()

    trackItem(reqId: string): Promise<string> {
        let pendingRes = new PendingItem<string>()
        this.itemCollectors.set(reqId, pendingRes)
        return pendingRes.promise()
    }

    itemSuccess(reqId: string, res: string): void {
        let pending = this.itemCollectors.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.success(res)
        this.itemCollectors.delete(reqId)
    }

    itemFailure(reqId: string, e: Error): void {
        let pendingRequest = this.itemCollectors.get(reqId);
        if (pendingRequest === undefined) throw new Error("x")
        pendingRequest!.failure("rejected")
        this.itemCollectors.delete(reqId)
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