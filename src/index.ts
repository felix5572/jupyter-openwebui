import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { Widget } from '@lumino/widgets';
import config from './config.json';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-openwebui:plugin',
  description: 'Open webui frontend to JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter-openwebui is activated!');

    // Get Open WebUI URL: config.json (environment variables handled at build time)
    const openwebUIUrl = config.openwebUIUrl || 'http://localhost:8080';
    console.log(`Open WebUI URL: ${openwebUIUrl}`);

    // 创建聊天面板
    const content = new Widget();
    content.id = 'openwebui-chat';
    content.title.label = config.title || 'Open WebUI';
    content.title.closable = true;
    content.title.iconClass = config.iconClass;
    
    // 创建并嵌入iframe
    const iframe = document.createElement('iframe');
    iframe.src = openwebUIUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // 添加错误处理
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
    
    app.shell.add(content, 'main', { mode: 'split-left' });
  }
};

export default plugin;