#!/usr/bin/env python3
"""
模拟测试选品分析功能
提交测试请求到 discovery 后端，轮询状态，完成后从数据库读取报告并输出
"""
import requests
import sqlite3
import time
import json

BACKEND_URL = 'http://localhost:8081'
TEST_EMAIL = 'tonylueng27149@gmail.com'

TEST_PAYLOAD = {
    "user_name": "Tony",
    "user_email": TEST_EMAIL,
    "industry": "家居/户外",
    "type": "discovery",
    "report_type": "product_discovery",
    "category_main": "Home & Kitchen",
    "category_sub": "Kitchen",
    "category_product": "Ice Maker",
    "category_path": "Home & Kitchen > Kitchen > Ice Maker",
    "keywords": "countertop ice maker, portable ice maker",
    "marketplace": "US",
    "reference_asins": [],
    "focus_areas": ["market-entry", "differentiation", "pricing"],
    "target_price_min": "50",
    "target_price_max": "150",
    "report_language": "zh",
    "custom_prompt": "",
    "ai_model": "anthropic/claude-sonnet-4.5",
    "submitted_at": "2026-01-31T12:00:00.000Z"
}

def main():
    print("=" * 60)
    print("选品分析模拟测试")
    print("=" * 60)
    print(f"邮箱: {TEST_EMAIL}")
    print(f"类目: {TEST_PAYLOAD['category_path']}")
    print(f"关键词: {TEST_PAYLOAD['keywords']}")
    print(f"站点: {TEST_PAYLOAD['marketplace']}")
    print()

    # 1. 检查后端是否运行
    try:
        r = requests.get(f"{BACKEND_URL}/", timeout=2)
    except requests.exceptions.ConnectionError:
        print("❌ 错误: Discovery 后端未启动 (端口 8081)")
        print("请先运行: python3 discovery_server.py")
        return 1

    # 2. 提交任务
    print("📤 提交选品分析任务...")
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/discovery/submit",
            json=TEST_PAYLOAD,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
    except Exception as e:
        print(f"❌ 提交失败: {e}")
        return 1

    if resp.status_code != 202:
        print(f"❌ 提交失败: {resp.status_code} - {resp.text}")
        return 1

    data = resp.json()
    task_id = data.get("task_id")
    print(f"✅ 任务已提交, task_id: {task_id}")
    print()

    # 3. 轮询状态
    print("⏳ 等待 AI 生成报告 (约 1-3 分钟)...")
    for i in range(60):  # 最多等 5 分钟
        time.sleep(5)
        try:
            status_resp = requests.get(
                f"{BACKEND_URL}/api/discovery/status",
                params={"task_id": task_id},
                timeout=5
            )
        except Exception as e:
            print(f"  轮询异常: {e}")
            continue

        if status_resp.status_code != 200:
            continue

        result = status_resp.json()
        status = result.get("status", "")

        if status == "COMPLETED":
            print("✅ 报告生成完成!")
            break
        elif status == "COMPLETED_NO_EMAIL":
            print("✅ 报告生成完成 (邮件未发送，SMTP 未配置)")
            break
        elif status == "FAILED":
            err = result.get("error_message", "Unknown error")
            print(f"❌ 任务失败: {err}")
            break
        else:
            print(f"   状态: {status} ... ({i*5}s)")
    else:
        print("⏱️ 超时，请稍后查看数据库或邮箱")
        return 1

    # 4. 从数据库读取报告
    conn = sqlite3.connect("discovery_tasks.db")
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT report_content, status, error_message FROM discovery_tasks WHERE task_id = ?",
        (task_id,)
    ).fetchone()
    conn.close()

    if not row:
        print("❌ 无法从数据库读取报告")
        return 1

    report = row["report_content"] or ""
    status = row["status"]
    err_msg = row["error_message"] or ""

    print()
    print("=" * 60)
    print("📋 选品分析报告")
    print("=" * 60)
    print()
    if report.startswith("ERROR:"):
        print(report)
    else:
        print(report)
    print()
    print("=" * 60)
    print(f"状态: {status}")
    if err_msg:
        print(f"错误信息: {err_msg}")
    print("=" * 60)

    if status in ("COMPLETED", "COMPLETED_NO_EMAIL") and not report.startswith("ERROR:"):
        print(f"\n📧 报告已发送至 {TEST_EMAIL} (若 SMTP 已配置)")
    return 0

if __name__ == "__main__":
    exit(main())
