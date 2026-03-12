# Cloud Run 环境变量配置说明

部署到 Google Cloud Run 后，需在 **Cloud Run 控制台** 手动添加以下环境变量。

## 配置路径

1. 打开 [Google Cloud Console](https://console.cloud.google.com/) → **Cloud Run**
2. 选择服务 `amz-site-central`（或你的服务名）
3. 点击 **「编辑并部署新版本」**
4. 在 **「变量和密钥」** 标签页添加环境变量
5. 点击 **「部署」** 保存并生效

---

## 一、AI 与报告生成

### OpenRouter API（选品分析必需）

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `OPENAI_API_KEY` | `sk-or-v1-xxxxxxxxxxxx` | 1. 打开 [OpenRouter](https://openrouter.ai/) 注册/登录<br>2. 点击右上角 **Keys** → **Create Key**<br>3. 复制生成的 Key，格式为 `sk-or-v1-` 开头 |

---

## 二、网页抓取与爬虫

### ScrapingBee API

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `SCRAPINGBEE_API_KEY` | `xxxxxxxxxxxxxxxx` | 1. 打开 [ScrapingBee](https://www.scrapingbee.com/) 注册<br>2. Dashboard → **API Key** 复制<br>3. 免费额度 1000 次/月 |

### Rapid API

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `RAPIDAPI_KEY` | `xxxxxxxxxxxxxxxx` | 1. 打开 [RapidAPI](https://rapidapi.com/) 注册<br>2. 右上角头像 → **My Apps** → 创建 App 或选择已有<br>3. 在 App 详情页复制 **X-RapidAPI-Key** |

> RapidAPI 上有多个 Amazon/产品数据相关 API（如 Rainforest、Real-Time Amazon 等），订阅后使用同一 Key 调用不同端点。

---

## 三、搜索引擎 / SERP

### Serper API（Google 搜索）

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `SERPER_API_KEY` | `xxxxxxxxxxxxxxxx` | 1. 打开 [Serper](https://serper.dev/) 注册<br>2. Dashboard → **API Key** 复制<br>3. 免费额度 2500 次/月 |

### SerpAPI

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `SERPAPI_KEY` | `xxxxxxxxxxxxxxxx` | 1. 打开 [SerpAPI](https://serpapi.com/) 注册<br>2. Dashboard → **API Key** 复制<br>3. 免费额度 100 次/月 |

---

## 四、YouTube 字幕

### YouTube Transcript API

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `YOUTUBE_TRANSCRIPT_DEV_API_KEY` | `AIzaSyxxxxxxxxxxxx` | 1. 打开 [Google Cloud Console](https://console.cloud.google.com/)<br>2. 启用 **YouTube Data API v3**<br>3. **凭据** → **创建凭据** → **API 密钥**<br>4. 复制生成的 Key（格式 `AIzaSy` 开头） |

> 若使用 `youtube-transcript-api` 等第三方库（不经过官方 API），部分场景可不填此 Key。

---

## 五、数据库（Supabase）

### Supabase

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | 1. 打开 [Supabase](https://supabase.com/) 创建项目<br>2. **Settings** → **API** → **Project URL** 复制 |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 同上页，**anon public** Key 复制 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 同上页，**service_role** Key 复制（仅服务端用，勿暴露前端） |

---

## 六、邮件发送

| 变量名 | 怎么填 | 获取方式 |
|--------|--------|----------|
| `SMTP_SERVER` | `smtp.gmail.com` | Gmail 默认 |
| `SMTP_PORT` | `587` | TLS 端口 |
| `SMTP_USER` | `your@gmail.com` | 发件邮箱 |
| `SMTP_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail: **Google 账号** → **安全性** → **两步验证** → **应用专用密码** 生成 16 位密码 |
| `SENDER_EMAIL` | `your@gmail.com` | 通常与 SMTP_USER 相同 |

---

## 七、通用配置

| 变量名 | 怎么填 | 说明 |
|--------|--------|------|
| `CORS_ORIGINS` | `https://flowaiagent.com` | 允许的跨域来源，多个用逗号分隔 |
| `ADMIN_API_TOKEN` | 自定义字符串 | 管理接口令牌（可选） |
| `OPENAI_BASE_URL` | `https://openrouter.ai/api/v1` | 默认即可 |
| `OPENAI_MODEL` | `anthropic/claude-sonnet-4.5` | 可选其他模型如 `openai/gpt-4o` |

---

## 快速复制清单（Cloud Run 变量和密钥）

| 变量名 | 值（示例/占位） |
|--------|-----------------|
| `OPENAI_API_KEY` | `sk-or-v1-xxxx` |
| `SCRAPINGBEE_API_KEY` | （可选） |
| `RAPIDAPI_KEY` | （可选） |
| `SERPER_API_KEY` | （可选） |
| `SERPAPI_KEY` | （可选） |
| `YOUTUBE_TRANSCRIPT_DEV_API_KEY` | （可选） |
| `SUPABASE_URL` | （可选） |
| `SUPABASE_ANON_KEY` | （可选） |
| `SUPABASE_SERVICE_ROLE_KEY` | （可选） |
| `SMTP_SERVER` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | （可选） |
| `SMTP_PASSWORD` | （可选） |
| `CORS_ORIGINS` | `https://flowaiagent.com` |

---

## 最小配置（仅选品分析）

```
OPENAI_API_KEY = sk-or-v1-你的OpenRouter密钥
CORS_ORIGINS = https://flowaiagent.com
```
