/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import * as vscode from 'vscode';
import WebSocket from 'ws';
import { WebSocketManager } from './globals';

export function activate(context: vscode.ExtensionContext) {
    console.log('AR Flame Graph extension activated.');

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

    const disposable = vscode.commands.registerCommand('arFlameGraph.open', () => {
        if (wsManager.isServerActive() && wsManager.connectedClient) {
          sendMessage('openFlameGraph');
        } else {
          vscode.window.showErrorMessage('La conexión WebSocket no está activa.');
        }
      });
    
      context.subscriptions.push(disposable, {
        dispose: () => {
          if (wsManager.isServerActive()) {
            wsManager.server?.close(() => {
              console.log('Servidor WebSocket cerrado.');
              wsManager.setServer(null);
            });
          }
        }
      });
}

export function sendMessage(message: string) {
    const wsManager = WebSocketManager.getInstance();
    const client = wsManager.connectedClient;

    if (wsManager.isServerActive() && client && client.readyState === WebSocket.OPEN) {
        client.send(message);
        console.log(`Message sent to client: ${message}`);
    } else {
        console.log('Unable to send message: WebSocket connection is not active or open.');
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