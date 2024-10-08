/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import * as vscode from 'vscode';
import { ICpuProfileRaw } from './types'; // Asegúrate de que esta interfaz esté definida
import { IProfileModel, buildModel } from './model'; // Importa las funciones necesarias
import { ReadonlyCustomDocument } from '../readonly-custom-document';
//import { DownloadFileProvider } from './download-file-provider';
export class ArCpuProfileEditorProvider 
{
    public async openCustomDocument(uri: vscode.Uri) {
        console.log('opoencustomdoc from arcpu', uri);
        const content = await vscode.workspace.fs.readFile(uri);
        const raw: ICpuProfileRaw = JSON.parse(new TextDecoder().decode(content));
        const document = new ReadonlyCustomDocument(uri, buildModel(raw));

        // Aquí puedes acceder a las propiedades de IProfileModel
        console.log('Profile Model:', document.userData);

        return document; // Asegúrate de devolver el documento correctamente
    }

    public extractRelevantData(document: ReadonlyCustomDocument<IProfileModel>) {
        const relevantData = document.userData.nodes.map(node => {
            const callFrame: CallFrame = (node as { callFrame?: { functionName: string; scriptId: string; url: string; lineNumber: number; columnNumber: number; } }).callFrame || {}; // Especificar el tipo de callFrame
            return {
                id: node.id,
                functionName: (callFrame.functionName ? callFrame.functionName : 'unknown'), // Valor por defecto si no está definido
                url: callFrame.url || 'unknown', // Valor por defecto si no está definido
                lineNumber: callFrame.lineNumber !== undefined ? callFrame.lineNumber : -1, // Valor por defecto
                hitCount: (node as { hitCount?: number }).hitCount || 0, // Proporcionar valor por defecto
                children: node.children.map(childId => {
                    const childNode = document.userData.nodes.find(n => n.id === childId);
                    const childCallFrame = (childNode as { callFrame?: { functionName: string; scriptId: string; url: string; lineNumber: number; columnNumber: number; } })?.callFrame || {}; // Asegúrate de que callFrame esté definido
                    return {
                        id: childNode?.id || -1, // Valor por defecto si childNode es undefined
                        functionName: (childCallFrame as { functionName?: string }).functionName || 'unknown', // Valor por defecto si no está definido
                        url: (childCallFrame as { url?: string }).url || 'unknown', // Valor por defecto si no está definido
                        lineNumber: (childCallFrame as { lineNumber?: number }).lineNumber !== undefined ? (childCallFrame as { lineNumber?: number }).lineNumber : -1, // Valor por defecto
                        hitCount: (childNode as { hitCount?: number })?.hitCount || 0, // Valor por defecto si childNode es undefined
                    };
                }),
                locationId: node.locationId,
            };
        });

        return relevantData;
    }
}

interface CallFrame {
    functionName?: string;
    url?: string;
    lineNumber?: number;
}

