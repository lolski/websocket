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
        let split = res.split(":")
        if (split.length !== 2) throw new Error("x")
        let reqId = split[0]
        let resValue = split[1]
        this.requestTracker.respondedSuccess(reqId, resValue)
    }

    send(req: string): Promise<string> {
        let reqId = "" + Math.max()
        let pending = this.requestTracker.new_(reqId)
        this.websocket.send(reqId + ":" + req)
        return pending
    }
}

class PendingRequest {
    constructor() {
    }

    resolve(value: string) {

    }
}

class RequestTracker {
    private pendingList: Map<string, PendingRequest> = new Map<string, PendingRequest>()

    new_(reqId: string): Promise<string> {
    }

    respondedSuccess(reqId: string, res: string): void {
    }

    respondedFailure(reqId: string, e: Error): void {
    }
}