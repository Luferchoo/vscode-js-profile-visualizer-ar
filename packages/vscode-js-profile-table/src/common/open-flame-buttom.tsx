/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as Flame from '@vscode/codicons/src/icons/flame.svg';
import { FunctionComponent, h } from 'preact';
import { useCallback, useContext } from 'preact/hooks';
import { sendMessage } from 'vscode-js-profile-ar/src/extension';
import { ToggleButton } from 'vscode-js-profile-core/out/esm/client/toggle-button';
import { VsCodeApi } from 'vscode-js-profile-core/out/esm/client/vscodeApi';
import { IReopenWithEditor } from 'vscode-js-profile-core/out/esm/common/types';
const OpenFlameButton: FunctionComponent<{ viewType: string; requireExtension: string }> = ({
  viewType,
  requireExtension,
}) => {
  const vscode = useContext(VsCodeApi);

  const closeFlameGraph = useCallback(() => {
    // Enviar un mensaje usando sendMessage
    sendMessage('flameGraphRequested');

    // Ejecutar el código existente
    vscode.postMessage<IReopenWithEditor>({
      type: 'reopenWith',
      viewType,
      requireExtension,
    });
  }, [vscode]);

  return (
    <ToggleButton icon={Flame} label="Show flame graph" checked={false} onClick={closeFlameGraph} />
  );
};

export default OpenFlameButton;