# Use official Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (required for building JupyterLab extensions)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install JupyterLab and required Python packages
RUN pip install --no-cache-dir \
    jupyterlab>=4.0.0,<5 \
    hatch \
    hatch-jupyter-builder

# Copy extension source code
COPY . /app/

# Install Node.js dependencies and build the extension
RUN npm install -g yarn \
    && yarn install \
    && yarn build:prod

# Install the extension in development mode
RUN pip install -e .

# Create jupyter config directory
RUN mkdir -p /root/.jupyter

# Create jupyter configuration file with environment variable support
RUN echo "c.ServerApp.ip = '0.0.0.0'" > /root/.jupyter/jupyter_server_config.py \
    && echo "c.ServerApp.port = 8888" >> /root/.jupyter/jupyter_server_config.py \
    && echo "c.ServerApp.allow_root = True" >> /root/.jupyter/jupyter_server_config.py \
    && echo "c.ServerApp.token = ''" >> /root/.jupyter/jupyter_server_config.py \
    && echo "c.ServerApp.password = ''" >> /root/.jupyter/jupyter_server_config.py

# Set environment variables with default values
ENV OPENWEBUI_URL=http://localhost:8080
ENV JUPYTER_PORT=8888

# Expose the port
EXPOSE 8888

# Create startup script that updates config at runtime
RUN echo '#!/bin/bash\n\
echo "Starting JupyterLab with Open WebUI integration..."\n\
echo "Open WebUI URL: ${OPENWEBUI_URL:-http://localhost:8080}"\n\
echo "JupyterLab will be available at: http://localhost:$JUPYTER_PORT"\n\
\n\
# Start JupyterLab\n\
jupyter lab --no-browser --allow-root --ip=0.0.0.0 --port=$JUPYTER_PORT\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]
