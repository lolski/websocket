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
        this.responsesCollector.collectSuccess(reqId, resValue)
    }

    public requestItem(req: string): Promise<string> {
        let reqId = uuid()
        let pendingRes = this.responsesCollector.track(reqId)
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
    private responseCollectors: Map<string, PendingResponse<string>> = new Map<string, PendingResponse<string>>()

    track(reqId: string): Promise<string> {
        let pendingRes = new PendingResponse<string>()
        this.responseCollectors.set(reqId, pendingRes)
        return pendingRes.promise()
    }

    collectSuccess(reqId: string, res: string): void {
        let pending = this.responseCollectors.get(reqId);
        if (pending === undefined) throw new Error("x")
        pending!.success(res)
        this.responseCollectors.delete(reqId)
    }

    collectFailure(reqId: string, e: Error): void {
        let pendingRequest = this.responseCollectors.get(reqId);
        if (pendingRequest === undefined) throw new Error("x")
        pendingRequest!.failure("rejected")
        this.responseCollectors.delete(reqId)
    }
}

class PendingResponse<T> {
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