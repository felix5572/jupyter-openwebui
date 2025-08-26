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

# Install JupyterLab and required Python packages first
RUN pip install --no-cache-dir \
    jupyterlab \
    hatch \
    hatch-jupyter-builder

# Copy extension source cod
COPY . /app/

# Install the extension (this will trigger the build via hatch)
RUN pip install -e .

# Set environment variables with default values
ENV OPENWEBUI_URL=http://localhost:8080
ENV JUPYTER_PORT=8888

# Expose the port
EXPOSE 8888

# Create startup script with all config via command line
RUN echo '#!/bin/bash\n\
echo "Starting JupyterLab with Open WebUI integration..."\n\
echo "Open WebUI URL: ${OPENWEBUI_URL:-http://localhost:8080}"\n\
echo "JupyterLab will be available at: http://localhost:$JUPYTER_PORT"\n\
echo "Notebook directory: /app/notebooks"\n\
\n\
# Start JupyterLab with all settings via command line\n\
exec jupyter lab \\\n\
  --no-browser \\\n\
  --allow-root \\\n\
  --ip=0.0.0.0 \\\n\
  --port=$JUPYTER_PORT \\\n\
  --ServerApp.token="${JUPYTER_TOKEN:-}" \\\n\
  --ServerApp.password="${JUPYTER_PASSWORD:-}" \\\n\
  --ServerApp.disable_check_xsrf=True \\\n\
  --ServerApp.open_browser=False\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]
