# Google Cloud Run 部署与域名配置指南

本指南将详细说明如何将您的网站部署到 **Google Cloud Run** 并配置您的 **自定义域名**。

## 1. 准备工作

1.  **Google Cloud 账号**: 确保您有一个 [Google Cloud Platform (GCP)](https://console.cloud.google.com/) 账号。
2.  **创建项目**: 在 GCP 控制台中创建一个新项目（例如命名为 `amz-ai-analysis`）。
3.  **安装工具**: 确保您的电脑上安装了 Google Cloud SDK (`gcloud` 命令行工具)。
    *   如果未安装，请下载并安装：[安装 Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
4.  **开启计费**: 确保项目已关联结算账号（Cloud Run 有免费额度，但需要绑定卡）。

## 2. 部署网站 (命令行方式)

这是最简单快捷的方法，只需要一条命令即可完成构建和部署。

### 第一步：登录并设置项目
在您的终端 (Terminal) 或 PowerShell 中运行：

```bash
# 1. 登录 Google 账号 (会弹出浏览器窗口)
gcloud auth login

# 2. 设置当前项目 ID (将 YOUR_PROJECT_ID 替换为您真实的项目 ID)
gcloud config set project YOUR_PROJECT_ID
```

### 第二步：一键部署
在项目根目录下（即包含 `Dockerfile` 的文件夹），运行以下命令：

```bash
gcloud run deploy amz-ai-replica --source . --allow-unauthenticated --region us-central1
```

*   `amz-ai-replica`: 这是您的服务名称，您可以随意修改。
*   `--source .`: 表示使用当前目录下的源代码（和 Dockerfile）进行构建。
*   `--allow-unauthenticated`: **重要**，这允许任何人访问您的网站（公开访问）。
*   `--region us-central1`: 部署区域，您可以改为 `asia-east1` (台湾) 或 `asia-northeast1` (东京) 以获得更快的亚洲访问速度。

**部署成功后**，终端会显示一个 **Service URL** (例如 `https://amz-ai-replica-xyz-uc.a.run.app`)。点击该链接即可预览您的网站。

---

## 3. 配置自定义域名 (解析域名)

现在，我们将把您的域名（例如 `www.yourdomain.com`）指向刚刚部署的 Cloud Run 服务。

### 第一步：进入 Cloud Run 控制台
1.  打开 [Google Cloud Console](https://console.cloud.google.com/)。
2.  在左侧菜单或搜索栏中找到并点击 **Cloud Run**。
3.  您应该能看到刚刚部署的服务 `amz-ai-replica`。

### 第二步：添加自定义域名映射
1.  在 Cloud Run 页面顶部，点击 **"管理自定义网域" (Manage Custom Domains)** 按钮。
2.  点击 **"添加映射" (Add Mapping)**。
3.  **选择服务**: 选择 `amz-ai-replica`。
4.  **选择网域**:
    *   点击下拉菜单，选择 **"验证新网域"** (如果您还没验证过)。
    *   输入您的根域名（例如 `example.com`），然后点击验证。这通常会跳转到 Google Webmaster Central。您需要按照提示（通常是添加一个 TXT 记录到您的 DNS）来证明您拥有该域名。
    *   验证完成后，回到 Cloud Run 界面，选择您的域名。
5.  **子网域**: 输入您想使用的子域名，例如 `www` (即 `www.example.com`)，或者留空以使用根域名。
6.  点击 **"继续"**。

### 第三步：更新 DNS 记录
Google Cloud 会为您生成一组 DNS 记录，通常是 **A 记录** 或 **AAAA 记录**。

1.  登录您的 **域名注册商后台** (例如 GoDaddy, Namecheap, 阿里云, 腾讯云等)。
2.  找到 **DNS 管理** 或 **域名解析** 设置。
3.  **添加记录**: 按照 Google Cloud 的提示添加记录。
    *   **类型 (Type)**: 通常是 `A`。
    *   **主机记录 (Host/Name)**: 如果是根域名填 `@`，如果是 `www` 填 `www`。
    *   **记录值 (Value/Data)**: 填入 Google Cloud 提供的 IP 地址（通常有 4 个 IP，建议全部添加）。
4.  保存设置。

### 第四步：等待生效
*   DNS 解析通常需要几分钟到几小时生效。
*   Google Cloud 会自动为您申请和配置 **SSL 证书 (HTTPS)**。这可能需要 15-30 分钟。
*   当 Cloud Run 控制台中的域名状态显示为绿色对勾时，您就可以通过 `https://www.yourdomain.com` 访问您的网站了！

## 4. 生产环境重要说明（必读）

### 4.1 只运行一个后端进程

本仓库的 **GitHub Actions**（`.github/workflows/deploy.yml`）与推荐 **Dockerfile** 均只启动 **`payment_server.py`**。  
该进程同时提供：静态页面、订单/支付轮询、竞品分析（n8n 代理）、**选品 Discovery**（`/api/discovery/*`）。

历史文件 **`discovery_server.py`** 与 **`start.sh` 双进程** 属于重复实现：第二个进程默认监听 **8081**，在 **Cloud Run 上外网不可达**，且浪费资源。**请勿在生产同时启动两个 Python 服务。**

### 4.2 选品（Discovery）后台任务与 CPU

选品提交接口返回 **202** 后，报告在**后台线程**中生成。若使用 Cloud Run 默认的「仅在有请求时分配 CPU」，线程可能在请求结束后**几乎拿不到 CPU**，任务卡住或极慢。

部署时请为服务关闭 CPU 节流（**CPU 在实例存活期间始终分配**），例如：

```bash
gcloud run deploy YOUR_SERVICE_NAME \
  --source . \
  --region us-central1 \
  --no-cpu-throttling \
  --command="python" \
  --args="payment_server.py"
```

本仓库的 GitHub Actions 已加上 **`--no-cpu-throttling`**。注意：计费方式与「按请求分配 CPU」不同，请查看 [Cloud Run CPU 分配说明](https://cloud.google.com/run/docs/configuring/cpu-allocation)。

### 4.3 数据持久化（SQLite vs Firestore）

容器内 **`orders.db` / `discovery_tasks.db`** 在实例重建后**可能丢失**。正式环境建议：

* 配置 **`PERSISTENCE_BACKEND`** 与 **Firestore**（见 `payment_server.py` 中 `PERSISTENCE_BACKEND`、`google-cloud-firestore`），或  
* 使用外置数据库（Cloud SQL 等）。

### 4.4 环境变量（节选）

| 变量 | 说明 |
|------|------|
| `N8N_WEBHOOK_URL` | 竞品分析 n8n Webhook（勿把密钥写进仓库） |
| `OPENAI_API_KEY` / `OPENROUTER_API_KEY` | 选品 LLM |
| `ADMIN_API_TOKEN` | 管理接口（含原公开的 `record_usage` 等） |
| `PERSISTENCE_BACKEND` | 持久化策略，生产建议 Firestore |

---

## 常见问题

*   **API 未启用**: 如果部署时提示 API 未启用，请根据终端提示的链接点击启用 (Cloud Run API, Artifact Registry API, Cloud Build API)。
*   **403 Forbidden**: 确保部署命令中包含了 `--allow-unauthenticated`，否则只有登录的 Google 用户才能访问。
