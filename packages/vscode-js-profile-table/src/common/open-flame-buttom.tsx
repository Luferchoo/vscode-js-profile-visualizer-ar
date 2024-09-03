/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as Flame from '@vscode/codicons/src/icons/flame.svg';
import { FunctionComponent, h } from 'preact';
import { useCallback, useContext } from 'preact/hooks';
import { ToggleButton } from 'vscode-js-profile-core/out/esm/client/toggle-button';
import { VsCodeApi } from 'vscode-js-profile-core/out/esm/client/vscodeApi';
import { IReopenWithEditor } from 'vscode-js-profile-core/out/esm/common/types';
//import { WebSocketManager } from 'vscode-js-profile-ar/src/globals'; // Asegúrate de que la ruta sea correcta
import { sendMessage } from 'vscode-js-profile-ar/src/extension'; // Asegúrate de que la ruta sea correcta

const OpenFlameButton: FunctionComponent<{ viewType: string; requireExtension: string }> = ({
  viewType,
  requireExtension,
}) => {
  const vscode = useContext(VsCodeApi);
  //const wsManager = WebSocketManager.getInstance(); // Usa WebSocketManager para manejar la conexión WebSocket

  const closeFlameGraph = useCallback(() => {
    // Envía el mensaje WebSocket
    //if (wsManager.server && wsManager.connectedClient) {
      sendMessage('flameGraphRequested');
    //} else {
      //console.log('WebSocket connection is not established.');
    //}

    // Envía el mensaje de postMessage
    vscode.postMessage<IReopenWithEditor>({
      type: 'reopenWith',
      viewType,
      requireExtension,
    });
  }, [vscode, /*wsManager,*/ viewType, requireExtension]);

  return (
    <ToggleButton icon={Flame} label="Show flame graph" checked={false} onClick={closeFlameGraph} />
  );
};

export default OpenFlameButton;
