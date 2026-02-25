# AI Handover Document (项目灵魂备份与交接文档)

**重要说明给未来的 AI 助手 (Dear Future AI Agent):**
当你（如 Cursor, Claude, GitHub Copilot, Gemini 等）打开这个项目时，**请务必首先阅读此文件**。这里记录了开发过程中的关键架构决策、踩过的坑以及特定的业务逻辑。**严禁在不知情的情况下重构或推翻以下核心设定。**

---

## 1. 架构选型与技术栈限制 (Architecture & Stack)
*   **前端**：纯 Vanilla HTML/CSS/JS 组合。**不需要也不允许**引入 React/Vue 等现代前端框架，不需要 Node.js 构建工具（Webpack/Vite等）。我们的目标是极简、轻量、纯静态托管。
*   **后端**：`discovery_server.py` 是一个基于 `Flask` 的超轻量级独立服务，专门处理 AI 请求和邮件发送。
*   **数据库**：使用的是本地 `SQLite` (`discovery_tasks.db`) 进行任务打点和状态轮询追踪。**不要**尝试将其复杂化为 MySQL、PostgreSQL 或云端数据库，除非收到全盘迁移指令。

## 2. API 调用与模型策略 (AI Models & Prompting)
*   **接入平台**：我们使用的是 **OpenRouter** (`https://openrouter.ai/api/v1`)，而不是直连 OpenAI 或 Anthropic 原生接口。
*   **多模型自由切换**：前端支持用户动态选择多种模型（Claude 3.5 Sonnet, GPT-4o, Gemini 2.0 Flash, DeepSeek），后端通过接收 `ai_model` 参数直接路由。不要修改此网关逻辑，更不要剥夺用户的模型选择权。
*   **中英双语输出格式**：Prompt 中有严格且精心调优的规定：报告的主体叙述必须是 **中文 (Simplified Chinese)**，但是产品词、亚马逊特定术语、用户原话引用等必须保留为 **英文 (English)**。**后续优化 Prompt 时，绝不可删掉这一规定！**

## 3. 已知踩坑与网络环境记录 (Known Issues & Gotchas)
*   **SMTP 邮件发送拦截**：
    *   我们在中国大陆网络或开启系统代理/VPN的情况下，底层的 `smtplib` 会在 TLS 握手阶段遇到 `SSL_ERROR_SYSCALL` 而连接断开，导致测试发件失败。
    *   **应对方案**：这不是代码 bug。线上部署到 Google Cloud Run 等纯净网络节点后，SMTP 连接将畅通无阻。如果在本地修改代码，遇到发邮件超时或失败，优先排查代理网关。
*   **环境变量 (`.env.discovery`)**：
    *   严禁在代码中写死硬编码任何密钥。所有的 API Key、发件邮箱账号和 App Password 都必须通过 `python-dotenv` 加载。相关配置名和缺省值见 `.env.example.discovery`。

## 4. UI/UX 设定不能回退 (UI/UX Commitments)
*   **体验细节保护**：
    *   `discovery.html` 表单字段是**中英双语对照**（例如 "主类目 (Main Category)"），不要将其重置为纯英文模板。
    *   `report.html` 中的“下载 PDF”按钮并不是真的下载（长期规划中），而是一个通过弹窗引导用户添加微信客服索要高清版的增长策略。请不要把它当做 bug 去修复。
    *   长报告的侧边栏目录 (TOC) 启用了 `sticky` 吸顶和滚动高亮联动，如果遇到页面溢出问题，请从 CSS 作用域入手，不要拆除这个交互框架。

---
最后更新于：2026-02-25
维护者：Antigravity (Gemini-based AI Agent) & Tony Manager
