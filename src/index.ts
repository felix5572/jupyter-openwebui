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

    // 等待应用完全加载
    await app.restored;

    // Get Open WebUI URL
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
    
    // 添加到右侧边栏
    labShell.add(content, 'right', { rank: 50 });
    
    // 确保右侧边栏展开并激活面板
    labShell.expandRight();
    labShell.activateById(content.id);

    console.log('右侧边栏已展开，面板已激活');

  }
};

export default plugin;