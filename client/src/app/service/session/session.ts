import {ResilientWebsocket} from "./websocket/resilient-websocket";

export class Session {
    private websocket: ResilientWebsocket
    private requestTracker: RequestTracker

    constructor() {
        this.websocket = new ResilientWebsocket(
            "",
            () => {},
            () => {},
            this.getMessageReceiver,
            () => {},
        )
        this.requestTracker = new RequestTracker()
    }

    private getMessageReceiver(res: string): void {
        let split = res.split("///")
        if (split.length !== 2) throw new Error("x")
        let reqId = split[0]
        let resValue = split[1]
        this.requestTracker.respondedSuccess(reqId, resValue)
    }

    send(req: string): Promise<string> {
        let reqId = "" + Math.max()
        let pending = this.requestTracker.new_(reqId)
        this.websocket.send(reqId + "///" + req)
        return pending
    }

    close() {
        this.websocket.close()
    }

    static create(): [Promise<string>, PromiseResolver<string>] {
        let promiseResolver
        let promise = new Promise((_resolve: (val: string) => void, _reject: (e: Error) => void): void => {
            promiseResolver = new PromiseResolver<string>(_resolve, _reject)
        });

        return [promise, promiseResolver]
    }
}

class PromiseResolver<T> {
    private readonly resolve: (val: T) => void
    private readonly reject: (e: Error) => void

    constructor(resolve: (val: T) => void, reject: (e: Error) => void) {
        this.resolve = resolve
        this.reject = reject
    }

    respondedSuccess(value: T) {
        this.resolve(value)
    }

    respondedFailure(e: Error) {
        this.reject(e)
    }
}

class RequestTracker {
    private pendingList: Map<string, PromiseResolver> = new Map<string, PromiseResolver>()

    new_(reqId: string): Promise<string> {
        this.pendingList.set(reqId, pending)
        return promise
    }

    respondedSuccess(reqId: string, res: string): void {
        let pendingRequest = this.pendingList.get(reqId);
        if (pendingRequest !== undefined) throw new Error("x")
        pendingRequest!.respondedSuccess(res)
    }

    respondedFailure(reqId: string, e: Error): void {
        let pendingRequest = this.pendingList.get(reqId);
        if (pendingRequest !== undefined) throw new Error("x")
        pendingRequest!.respondedFailure(e)
    }
}