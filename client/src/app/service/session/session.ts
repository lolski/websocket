import {ResilientWebsocket} from "./websocket/resilient-websocket";

export class Session {
    private websocket: ResilientWebsocket
    private responseTracker: ResponsesTracker

    constructor() {
        this.websocket = new ResilientWebsocket(
            "",
            () => {},
            () => {},
            this.getMessageReceiver,
            () => {},
        )
        this.responseTracker = new ResponsesTracker()
    }

    private getMessageReceiver(res: string): void {
        let split = res.split(":")
        if (split.length !== 2) throw new Error("x")
        let reqId = split[0]
        let resValue = split[1]
        this.responseTracker.success(reqId, resValue)
    }

    send(req: string): Promise<string> {
        let reqId = "" + Math.max()
        let promise = this.responseTracker.track(reqId)
        this.websocket.send(reqId + ":" + req)
        return promise
    }
}

class ResponseTracker {
    constructor() {
    }

    resolve(value: string) {

    }
}

class ResponsesTracker {
    private responsePending: Map<string, ResponseTracker> = new Map<string, ResponseTracker>()

    track(reqId: string): Promise<string> {
    }

    success(reqId: string, value: string): void {
    }

    failure(reqId: string, e: Error): void {
    }
}