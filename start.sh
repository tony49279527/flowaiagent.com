#!/bin/bash
set -euo pipefail
# 与 Cloud Run / GitHub Actions 一致：只启动统一站点服务（含静态站、订单、竞品、选品 Discovery API）。
# discovery_server.py 为历史重复实现，外网无法访问其 8081，且会与 payment_server 抢资源；请勿在生产使用双进程。
cd "$(dirname "$0")"
exec python3 payment_server.py
