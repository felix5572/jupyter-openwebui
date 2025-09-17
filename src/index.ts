import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';

import { Widget } from '@lumino/widgets';
import { buildIcon } from '@jupyterlab/ui-components';
import config from './config.json';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-openwebui:plugin',
  description: 'Open webui frontend to JupyterLab extension.',
  autoStart: true,
  requires: [ILauncher],
  activate: async (app: JupyterFrontEnd,  launcher: ILauncher) => {
    console.log('JupyterLab extension jupyter-openwebui is activated!');

    const loadOpenWebUIUrl = async () => {
      try {
        const response = await fetch('/api/contents/open_webui_url.txt'); //    file at   /open_webui_url.txt in the root of the server
        const data = await response.json();
        const openWebUIUrl = data.content.trim();
        console.log(`Open WebUI URL: ${openWebUIUrl}`);
        return openWebUIUrl;
      } catch (error) {
        console.warn('URL file not found, using fallback');
        return 'http://localhost:8080';
      }
    };

    const openWebUIUrl = await loadOpenWebUIUrl() || config.openWebUIUrl || 'http://localhost:8080';
  
    const content = new Widget();
    content.id = 'openwebui-chat';
    content.title.label = config.title || 'Open WebUI';
    content.title.closable = true;
    content.title.iconClass = config.iconClass || '';
    
    let retryCount = 0;
    const maxRetries = 8;
    const retryDelay = 5000;
    const loadTimeout = 40000;
    let timeoutId: number;
    let retryTimeoutId: number;
    let isInitialized = false;
  
    const showLoading = () => {
      
      content.node.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; color: #666;">
          <div style="font-size: 18px; margin-bottom: 10px;">🤖 Loading OpenWebUI...</div>
          <div style="font-size: 14px;">Connecting to ${openWebUIUrl}</div>
          <div style="margin-top: 15px; font-size: 12px;">Attempt ${retryCount + 1} of ${maxRetries}</div>
          <div style="margin-top: 10px; font-size: 12px; color: #999;">Please wait...</div>
        </div>
      `;
    };
  
    const loadIframe = async () => {
      // Clean up previous timers
      try {
        await fetch(openWebUIUrl, { method: 'HEAD', mode: 'no-cors' });
      } catch {
        // 如果连接失败，延迟后重试整个loadIframe
        if (retryCount < maxRetries) {
          retryTimeoutId = setTimeout(() => {
            loadIframe();
          }, retryDelay);
          return;
        }
      }
      
      if (timeoutId) clearTimeout(timeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      
      retryCount++;
      console.log('Before loading, showing loading page');
      showLoading();
      
      // Wait a bit before creating iframe to let loading display first
      setTimeout(() => {
        console.log('Creating iframe');
        const iframe = document.createElement('iframe');
        iframe.src = openWebUIUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'none'; // Hide iframe initially
        
        let loaded = false;
        
        iframe.onload = () => {
          console.log('OpenWebUI loaded successfully');
          if (timeoutId) clearTimeout(timeoutId);
          if (retryTimeoutId) clearTimeout(retryTimeoutId);
          
          loaded = true;
          iframe.onload = null;
            
            // Clear loading and show iframe
          content.node.innerHTML = '';
          iframe.style.display = 'block';
          content.node.appendChild(iframe);
        };
        
        // Add iframe to DOM but keep it hidden
        content.node.appendChild(iframe);
        
        // Timeout detection
        timeoutId = setTimeout(() => {
          if (!loaded) {
            console.log(`OpenWebUI load timeout, attempt ${retryCount}/${maxRetries}`);
            
            // Remove current iframe
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            
            if (retryCount < maxRetries) {
              retryTimeoutId = setTimeout(() => {
                loadIframe();
              }, retryDelay);
            } else {
              // Final failure
              content.node.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #d32f2f;">
                  <h3>❌ Unable to connect to OpenWebUI</h3>
                  <p>URL: ${openWebUIUrl}</p>
                  <p>Service may not be running. Please start OpenWebUI and refresh.</p>
                  <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                  </button>
                </div>
              `;
            }
          }
        }, loadTimeout);
      }, 3000); // Let loading display for 3000ms
    };


    

    const setupLauncher = () => {
      // 添加命令
      console.log('Adding command to launcher');
      app.commands.addCommand('openwebui:activate', {
          label: 'OpenWebUI Frontend',
          caption: 'Open WebUI Chat Agent & Chat',
          icon: buildIcon,
          execute: async () => {
              const webUIUrl = await loadOpenWebUIUrl();
              console.log(`Opening: ${webUIUrl}`);
              window.open(webUIUrl, '_blank');
          }
      });
      console.log('Command added to launcher');
      // 添加到启动器
      launcher.add({
        command: 'openwebui:activate',
        category: 'Other',
        rank: 1
      });
      console.log('Launcher item added');
    };

    // Setup launcher
    setupLauncher();

    const initIframe = () => {
      if (isInitialized) return;
      console.log('Launcher setup complete');
    
      app.shell.add(content, 'left', { rank: 0 });
      console.log('Content added to shell');
      app.restored.then(() => {
        app.shell.activateById(content.id);
        loadIframe();
      }).catch((error) => {
        console.error('Failed to restore JupyterLab:', error);
        // Try to load even if restoration fails
        loadIframe();
      });
      isInitialized = true;
      };

    console.log('Initializing iframe');
    initIframe();
  }
};

export default plugin;