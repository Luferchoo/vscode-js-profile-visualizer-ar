import WebSocket from 'ws';

export class WebSocketManager {
    private static instance: WebSocketManager;
    public server: WebSocket.Server | null = null;
    public connectedClient: WebSocket | null = null;

    private constructor() {
        console.log('WebSocketManager instance created');
    }

    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    public setConnectedClient(client: WebSocket | null) {
        this.connectedClient = client;
        console.log('Connected client set:', client);
    }

    public setServer(server: WebSocket.Server | null) {
        this.server = server;
        console.log('WebSocket server set:', server);
    }

    public isServerActive(): boolean {
        return this.server !== null;
    }
}