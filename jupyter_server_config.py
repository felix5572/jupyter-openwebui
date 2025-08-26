# JupyterLab Server Configuration
import os

# Basic server settings
c.ServerApp.ip = '0.0.0.0'
c.ServerApp.port = int(os.environ.get('JUPYTER_PORT', 8888))
c.ServerApp.allow_root = True

# Security settings
c.ServerApp.token = os.environ.get('JUPYTER_TOKEN', '')
c.ServerApp.password = os.environ.get('JUPYTER_PASSWORD', '')
c.ServerApp.disable_check_xsrf = True

# Open WebUI integration
c.ServerApp.open_browser = False
c.ServerApp.notebook_dir = '/app/notebooks'

# Additional settings
c.ServerApp.terminado_settings = {
    'shell_command': ['/bin/bash']
}

# Enable extensions
c.ServerApp.jpserver_extensions = {
    'jupyter_openwebui': True
}
