import * as vscode from 'vscode';
import * as WebSocket from 'ws';

let server: WebSocket.Server | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('WebSocket extension activated.');

    // Register a command to start the WebSocket server
    let disposable = vscode.commands.registerCommand('extension.startWebSocketServer', () => {
        if (!server) {
            // Start WebSocket server
            server = new WebSocket.Server({ port: 8080 });

            server.on('connection', (ws) => {
                console.log('Client connected');

                ws.on('message', (message) => {
                    console.log('Received:', message);

                    // Example: Send a response back to the client
                    ws.send(`Received your message o VS Code Extention: ${message}`);
                });

                ws.on('close', () => {
                    console.log('Client disconnected');
                });
            });

            server.on('listening', () => {
                console.log('WebSocket server is listening on ws://localhost:8080');
            });

            server.on('error', (error) => {
                console.error('WebSocket server error:', error);
            });

            console.log('WebSocket server running on ws://localhost:8080');
        } else {
            console.log('WebSocket server already running.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (server) {
        server.close(() => {
            console.log('WebSocket server closed.');
        });
    }
}
