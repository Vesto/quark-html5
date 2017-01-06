import { WebSocket, WebSocketBacking } from "quark";
import NodeWebSocket = require("ws");

export class QKWebSocket extends NodeWebSocket implements WebSocketBacking {
    public qk_onOpen: () => void;
    public qk_onError: (error: Error) => void;
    public qk_onClose: (code: number, reason: string) => void;
    public qk_onMessage: (data: WebSocket.Data) => void;

    public constructor(url: string, protocols: string[]) {
        super(url, protocols);

        // Add event listeners
        this.addListener("open", () => {
            this.qk_onOpen();
        });
        this.addListener("error", (error) => {
            this.qk_onError(error);
        });
        this.addListener("close", (code, message) => {
            this.qk_onClose(code, message);
        });
        this.addListener("message", (data) => {
            this.qk_onMessage(data);
        });
    }

    public get qk_state(): WebSocket.State {
        switch (this.readyState) {
            case this.CONNECTING:
                return WebSocket.State.Connecting;
            case this.OPEN:
                return WebSocket.State.Open;
            case this.CLOSING:
                return WebSocket.State.Closing;
            case this.CLOSED:
                return WebSocket.State.Closed;
            default:
                return WebSocket.State.Closed
        }
    }

    public qk_close(code?: number, data?: WebSocket.Data): void {
        this.close(code, data);
    }

    public qk_pause(): void {
        this.pause();
    }

    public qk_resume(): void {
        this.resume();
    }

    public qk_terminate(): void {
        this.terminate();
    }

    public qk_send(data: WebSocket.Data): void {
        this.send(data);
    }
}

export function createWebSocketBacking(url: string, protocols: string[]): WebSocketBacking {
    return new QKWebSocket(url, protocols);
}
