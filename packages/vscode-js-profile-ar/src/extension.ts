/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import * as vscode from 'vscode';
import WebSocket from 'ws';
import { WebSocketManager } from './globals';

export function activate(context: vscode.ExtensionContext) {
    console.log('WebSocket extension activated.');

    const wsManager = WebSocketManager.getInstance();

    if (!wsManager.isServerActive()) {
        const serverInstance = new WebSocket.Server({ port: 8080 });
        wsManager.setServer(serverInstance);

        serverInstance.on('connection', (ws: WebSocket) => {
            console.log('Client connected');
            wsManager.setConnectedClient(ws);

            ws.on('message', (message: string) => {
                console.log('Received:', message);
                ws.send(`Received your message: ${message}`);
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                wsManager.setConnectedClient(null);
            });

            ws.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
            });
        });

        serverInstance.on('listening', () => {
            console.log('WebSocket server is listening on ws://localhost:8080');
        });

        serverInstance.on('error', (error: Error) => {
            console.error('WebSocket server error:', error);
        });

        console.log('WebSocket server running on ws://localhost:8080');
    } else {
        console.log('WebSocket server already running.');
    }

    context.subscriptions.push({
        dispose: () => {
            if (wsManager.isServerActive()) {
                wsManager.server?.close(() => {
                    console.log('WebSocket server closed.');
                    wsManager.setServer(null);
                });
            }
        }
    });
}

export function sendMessage(message: string) {
    const wsManager = WebSocketManager.getInstance();
    const client = wsManager.connectedClient;

    if (wsManager.isServerActive()) {
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(message);
            console.log(`Message sent to client: ${message}`);
        } else {
            console.log('No client is currently connected or client connection is not open.');
        }
    } else {
        console.log('WebSocket server is not active.');
    }
}

export function deactivate() {
    const wsManager = WebSocketManager.getInstance();
    if (wsManager.isServerActive()) {
        wsManager.server?.close(() => {
            console.log('WebSocket server closed.');
            wsManager.setServer(null);
        });
    }
}