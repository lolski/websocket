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

    close(): void {
        this.websocket.close()
    }
}

class RequestTracker {
    private pendingList: Map<string, Deferred<string>> = new Map<string, Deferred<string>>()

    new_(reqId: string): Promise<string> {
        let pending = new Deferred<string>()
        this.pendingList.set(reqId, pending)
        return pending.promise
    }

    respondedSuccess(reqId: string, res: string): void {
        let pendingRequest = this.pendingList.get(reqId);
        if (pendingRequest !== undefined) throw new Error("x")
        pendingRequest!.resolve(res)
    }

    respondedFailure(reqId: string, e: Error): void {
        let pendingRequest = this.pendingList.get(reqId);
        if (pendingRequest !== undefined) throw new Error("x")
        pendingRequest!.reject("rejected")
    }
}

class Deferred<T> {
    private _resolve: (value: T) => void = () => {};
    private _reject: (value: T) => void = () => {};

    private _promise: Promise<T> = new Promise<T>((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
    })

    public get promise(): Promise<T> {
        return this._promise;
    }

    public resolve(value: T) {
        this._resolve(value);
    }

    public reject(value: T) {
        this._reject(value);
    }
}