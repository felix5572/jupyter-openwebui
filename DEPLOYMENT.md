# 部署指南

## 项目结构

```
├── docker/
│   └── Dockerfile          # Docker容器配置
├── env.example             # 环境变量示例           # Zeabur部署配置
└── src/
    └── index.ts           # 支持环境变量的插件代码
```

## 环境变量配置

### 必需的环境变量

- `OPENWEBUI_URL`: Open WebUI服务的URL地址
- `JUPYTER_PORT`: JupyterLab端口 (默认: 8888)

### 可选的环境变量

- `JUPYTER_TOKEN`: JupyterLab访问令牌 (用于安全认证)

## Zeabur部署步骤

1. **推送代码到Git仓库**
   ```bash
   git add .
   git commit -m "Add Zeabur deployment configuration"
   git push
   ```

2. **在Zeabur控制台**
   - 创建新项目
   - 连接Git仓库
   - Zeabur会自动检测`docker/Dockerfile`

3. **配置环境变量**
   在Zeabur控制台的Environment Variables中设置：
   ```
   OPENWEBUI_URL=https://your-openwebui-domain.zeabur.app
   JUPYTER_PORT=8888
   ```

4. **部署**
   - Zeabur会自动构建并部署
   - 部署完成后会提供访问URL

## 本地开发

1. **复制环境变量文件**
   ```bash
   cp env.example .env
   ```

2. **编辑环境变量**
   ```bash
   # .env
   OPENWEBUI_URL=http://localhost:8080
   JUPYTER_PORT=8888
   ```

3. **构建并运行Docker容器**
   ```bash
   docker build -f docker/Dockerfile -t jupyter-openwebui .
   docker run -p 8888:8888 \
     -e OPENWEBUI_URL=http://localhost:8080 \
     jupyter-openwebui
   ```

## 故障排除

### 常见问题

1. **无法连接到Open WebUI**
   - 检查`OPENWEBUI_URL`环境变量是否正确
   - 确保Open WebUI服务正在运行
   - 检查网络连接和防火墙设置

2. **JupyterLab无法启动**
   - 检查端口是否被占用
   - 查看容器日志: `docker logs <container_id>`

3. **插件未加载**
   - 确保扩展已正确构建: `yarn build:prod`
   - 检查JupyterLab扩展列表: `jupyter labextension list`

### 查看日志

```bash
# Docker容器日志
docker logs <container_name>

# JupyterLab日志
# 在容器内查看 /root/.jupyter/jupyter_server_config.py
```

## 配置说明

### Dockerfile特点

- 基于Python 3.11-slim镜像
- 自动安装Node.js和yarn
- 支持环境变量注入
- 自动构建和安装JupyterLab扩展
- 配置JupyterLab允许root运行

### 插件特点

- 支持动态URL配置
- 提供连接错误处理
- 可配置标题和图标
- 输出详细的调试信息
