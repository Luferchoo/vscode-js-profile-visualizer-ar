import * as vscode from 'vscode';
import WebSocket from 'ws';

const { Server } = WebSocket;

let server: WebSocket.Server | null = null;
let connectedClient: WebSocket | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('WebSocket extension activated.');

    if (!server) {
        server = new Server({ port: 8080 });

        server.on('connection', (ws: WebSocket) => {
            console.log('Client connected');
            connectedClient = ws;

            ws.on('message', (message: string) => {
                console.log('Received:', message);
                ws.send(`Received your message: ${message}`);
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                connectedClient = null;
            });

            ws.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
            });
        });

        server.on('listening', () => {
            console.log('WebSocket server is listening on ws://localhost:8080');
        });

        server.on('error', (error: Error) => {
            console.error('WebSocket server error:', error);
        });

        console.log('WebSocket server running on ws://localhost:8080');
    } else {
        console.log('WebSocket server already running.');
    }

    context.subscriptions.push({
        dispose: () => {
            if (server) {
                server.close(() => {
                    console.log('WebSocket server closed.');
                });
            }
        }
    });
}

export function sendMessage(message: string) {
    if (connectedClient && connectedClient.readyState === WebSocket.OPEN) {
        connectedClient.send(message);
        console.log(`Message sent to client: ${message}`);
    } else {
        console.log('No client is currently connected or client connection is not open.');
    }
}

export function deactivate() {
    if (server) {
        server.close(() => {
            console.log('WebSocket server closed.');
        });
    }
}
