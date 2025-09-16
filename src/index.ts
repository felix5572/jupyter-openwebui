import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';

import { Widget } from '@lumino/widgets';
import config from './config.json';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-openwebui:plugin',
  description: 'Open webui frontend to JupyterLab extension.',
  autoStart: true,
  requires: [ILabShell],
  activate: async (app: JupyterFrontEnd, labShell: ILabShell) => {
    console.log('JupyterLab extension jupyter-openwebui is activated!');

    await app.restored;

    // Get Open WebUI URL
    const openwebUIUrl = config.openwebUIUrl || 'http://localhost:8080';
    console.log(`Open WebUI URL: ${openwebUIUrl}`);

    const content = new Widget();
    content.id = 'openwebui-chat';
    content.title.label = config.title || 'Open WebUI'; 
    content.title.closable = true;
    content.title.iconClass = config.iconClass;
    
    const iframe = document.createElement('iframe');
    iframe.src = openwebUIUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    iframe.onerror = () => {
      console.error(`Failed to load Open WebUI from: ${openwebUIUrl}`);
      content.node.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <h3>Unable to connect to Open WebUI</h3>
          <p>URL: ${openwebUIUrl}</p>
          <p>Please check if the Open WebUI service is running.</p>
        </div>
      `;
    };
    
    content.node.appendChild(iframe);
    
    labShell.add(content, 'left', { rank: 20 });
    labShell.add(content, 'right', { rank: 20 });
    
    labShell.expandRight();
    labShell.activateById(content.id);

    console.log('Open WebUI extension is activated!');

  }
};

export default plugin;