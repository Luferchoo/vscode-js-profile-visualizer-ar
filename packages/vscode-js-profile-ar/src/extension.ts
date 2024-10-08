/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import * as vscode from 'vscode';
import { ArCpuProfileEditorProvider } from 'vscode-js-profile-core/src/cpu/arCpuProfileEditorProvider';
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

        console.log('WebSocket server running on ws://localhost:8080');
    } else {
        console.log('WebSocket server already running.');
    }

    const disposable = vscode.commands.registerCommand('arFlameGraph.open', async (uri: vscode.Uri) => {
        const wsManager = WebSocketManager.getInstance();
        if (wsManager.isServerActive() && wsManager.connectedClient) {
          const ws = wsManager.connectedClient;
          console.log('esta es la uri en la extension',uri);
          if (uri) {
            const editorProvider = new ArCpuProfileEditorProvider();
            console.log('uri dentro de la extension', uri);
            // Pasar la URI al método openCustomDocument
            const document = await editorProvider.openCustomDocument(uri);
            console.log('document', document);
            const relevantData = editorProvider.extractRelevantData(document);
            
            // Envía el archivo cpuprofile y la información relevante
            ws.send(JSON.stringify({ type: 'cpuprofile', content: relevantData }));
            // Envía el mensaje para abrir el gráfico de llamas
            ws.send('openFlameGraph');
          } else {
            vscode.window.showErrorMessage('No se ha establecido la URI.');
          }
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
    const server = wsManager.server;

    if (wsManager.isServerActive() && server) {
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        console.log(`Message sent to all connected clients: ${message}`);
    } else {
        console.log('Unable to send message: WebSocket server is not active.');
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