import {KeepAliveWebsocket} from "./keep-alive-websocket";
import {MessageReceiver} from "./common";

export class ResilientWebsocket {
    private readonly keepAliveIntervalMs: number = 2000
    private readonly recreateDelayMs: number = 2000

    private readonly onOpen: () => void
    private readonly onOpenFailure: (e: CloseEvent) => void
    private currentMsgReceiver: MessageReceiver
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
        this.currentMsgReceiver = messageReceiver
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
            rws.currentMsgReceiver,
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

    setMessageReceiver(messageReceiver: MessageReceiver): void {
        this.currentMsgReceiver = messageReceiver
        this.websocket.setMessageReceiver(messageReceiver)
    }

    getMessageReceiver(): MessageReceiver {
        return this.currentMsgReceiver
    }

    send(message: string): void {
        this.websocket.send(message)
    }

    close(): void {
        this.shouldRecreate = false
        this.websocket.close()
    }
}
