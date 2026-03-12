#!/bin/bash
# OpenRouter API 连通性测试
# 用法: ./test_openrouter.sh 你的OpenRouter_Key
# 或:   OPENROUTER_API_KEY=sk-or-v1-xxx ./test_openrouter.sh

KEY="${1:-$OPENROUTER_API_KEY}"
if [ -z "$KEY" ]; then
  echo "用法: ./test_openrouter.sh 你的OpenRouter_Key"
  echo "或:   OPENROUTER_API_KEY=sk-or-v1-xxx ./test_openrouter.sh"
  exit 1
fi

echo "测试 OpenRouter API (Claude Sonnet 4.5)..."
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"anthropic/claude-sonnet-4.5","messages":[{"role":"user","content":"hello"}]}'

echo ""
echo "---"
echo "若返回 HTTP 200 且有 content 内容，说明 Key 和余额正常。"
echo "若返回 401，多为 Key 无效；若返回 402/429，多为余额不足。"
