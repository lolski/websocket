import {KeepAliveWebsocket} from "./keep-alive-websocket";
import {MessageReceiver} from "./common";

export class ResilientWebsocket {
    private readonly keepAliveIntervalMs: number = 2000
    private readonly recreateDelayMs: number = 2000

    private readonly onOpen: () => void
    private readonly onOpenFailure: (e: CloseEvent) => void
    private readonly messageReceiver: MessageReceiver
    private readonly onClose: (e: CloseEvent) => void
    private websocket: KeepAliveWebsocket
    private shouldRecreate: boolean

    constructor(
        url: string,
        onOpen: () => void,
        onOpenFailure: (e: CloseEvent) => void,
        messageReceiver: MessageReceiver,
        onClose: (e: CloseEvent) => void,
    ) {
        this.onOpen = onOpen
        this.onOpenFailure = onOpenFailure
        this.messageReceiver = messageReceiver
        this.onClose = onClose
        this.websocket = this.createWebsocket(url, this)
        this.shouldRecreate = true
    }

    private createWebsocket(url: string, rws: ResilientWebsocket): KeepAliveWebsocket {
        return new KeepAliveWebsocket(
            url,
            rws.keepAliveIntervalMs,
            rws.onOpen,
            (e: CloseEvent): void => {
                rws.onOpenFailure(e)
                if (rws.shouldRecreate) {
                    rws.scheduleRecreate(rws)
                }
            },
            rws.messageReceiver,
            (e: CloseEvent): void => {
                rws.onClose(e)
                if (rws.shouldRecreate) {
                    rws.scheduleRecreate(rws)
                }
            }
        );
    }

    private scheduleRecreate(rws: ResilientWebsocket): void {
        setTimeout(
            () => {
                this.websocket = rws.createWebsocket(rws.websocket.url(), rws)
            },
            this.recreateDelayMs)
    }

    send(message: string): void {
        this.websocket.send(message)
    }

    url(): string {
        return this.websocket.url()
    }

    close(): void {
        this.shouldRecreate = false
        this.websocket.close()
    }
}
