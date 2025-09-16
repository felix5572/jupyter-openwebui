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
  
    const openwebUIUrl = config.openwebUIUrl || 'http://localhost:8080';
    console.log(`Open WebUI URL: ${openwebUIUrl}`);
  
    const content = new Widget();
    content.id = 'openwebui-chat';
    content.title.label = config.title || 'Open WebUI';
    content.title.closable = true;
    content.title.iconClass = config.iconClass || '';
    
    let retryCount = 0;
    const maxRetries = 8;
    const retryDelay = 4000;
    const loadTimeout = 20000;
    let timeoutId: number;
    let retryTimeoutId: number;
  
    const showLoading = () => {
      content.node.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; color: #666;">
          <div style="font-size: 18px; margin-bottom: 10px;">🤖 Loading OpenWebUI...</div>
          <div style="font-size: 14px;">Connecting to ${openwebUIUrl}</div>
          <div style="margin-top: 15px; font-size: 12px;">Attempt ${retryCount + 1} of ${maxRetries}</div>
          <div style="margin-top: 10px; font-size: 12px; color: #999;">Please wait...</div>
        </div>
      `;
    };
  
    const loadIframe = () => {
      // 清理之前的定时器
      if (timeoutId) clearTimeout(timeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      
      retryCount++;
      console.log('开始加载，显示loading界面');
      showLoading();
      
      // 等一下再创建iframe，让loading先显示
      setTimeout(() => {
        console.log('创建iframe');
        const iframe = document.createElement('iframe');
        iframe.src = openwebUIUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'none'; // 先隐藏iframe
        
        let loaded = false;
        
        iframe.onload = () => {
          loaded = true;
          console.log('OpenWebUI loaded successfully');
          if (timeoutId) clearTimeout(timeoutId);
          if (retryTimeoutId) clearTimeout(retryTimeoutId);
          
          // 清空loading，显示iframe
          content.node.innerHTML = '';
          iframe.style.display = 'block';
          content.node.appendChild(iframe);
        };
        
        // 把iframe添加到DOM，但保持隐藏
        content.node.appendChild(iframe);
        
        // 超时检测
        timeoutId = setTimeout(() => {
          if (!loaded) {
            console.log(`OpenWebUI load timeout, attempt ${retryCount}/${maxRetries}`);
            
            // 移除当前iframe
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            
            if (retryCount < maxRetries) {
              retryTimeoutId = setTimeout(() => {
                loadIframe();
              }, retryDelay);
            } else {
              // 最终失败
              content.node.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #d32f2f;">
                  <h3>❌ Unable to connect to OpenWebUI</h3>
                  <p>URL: ${openwebUIUrl}</p>
                  <p>Service may not be running. Please start OpenWebUI and refresh.</p>
                  <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                  </button>
                </div>
              `;
            }
          }
        }, loadTimeout);
      }, 3000); // 让loading显示3000ms
    };
  
    app.shell.add(content, 'left', { rank: 0 });
    
    app.restored.then(() => {
      app.shell.activateById(content.id);
      loadIframe();
    }).catch((error) => {
      console.error('Failed to restore JupyterLab:', error);
      // 即使恢复失败也尝试加载
      loadIframe();
    });
  }
};

export default plugin;