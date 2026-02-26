#!/usr/bin/env python3
import os
import json
import shutil
import re
from pathlib import Path
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent
IMPORT_DIR = PROJECT_ROOT / "import"
REPORTS_DIR = PROJECT_ROOT / "data" / "reports"
INDEX_JSON = REPORTS_DIR / "index.json"

def sanitize_id(filename):
    """Convert filename to a clean ID for URLs."""
    # Remove extension
    name = os.path.splitext(filename)[0]
    # Replace spaces and special chars with hyphens
    clean = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]+', '-', name)
    return clean.strip('-').lower()

def extract_title(md_content, filename):
    """Extract report title from Markdown or filename."""
    # Priority 1: Frontmatter title: (if exists)
    title_raw = re.search(r'^title:\s*(.*)$', md_content, re.MULTILINE)
    if title_raw:
        return title_raw.group(1).strip().strip('"').strip("'")
    
    # Priority 2: Use cleaned filename as title (most reliable for this batch)
    name = os.path.splitext(filename)[0]
    # Remove common suffixes like -G3.0, -O5.1, -C4.5
    clean_name = re.sub(r'-(?:G|O|C)\s*\d\.\d$', '', name, flags=re.IGNORECASE).strip()
    return f"亚马逊 AI 竞品分析报告：{clean_name}"

def sanitize_content(content):
    """Remove WeChat promotional images and headers from the report."""
    # Matches the specific Feishu image followed by the promotional H1 and optional *** separator
    pattern = r'!\[.*?\]\(https?://[^\)]+\.feishu\.cn/[^\)]+\)\s*\n+#\s*\*\*添加我的微信[^\*]*\*\*\s*\n+(?:\*\*\*\s*\n+)?'
    cleaned = re.sub(pattern, '', content)
    
    # Fallback to remove just the promo text if the image pattern didn't match perfectly
    fallback_pattern = r'#\s*\*\*添加我的微信[^\*]*\*\*\s*\n+(?:\*\*\*\s*\n+)?'
    cleaned = re.sub(fallback_pattern, '', cleaned)
    
    return cleaned.strip() + '\n'

def main():
    print("🚀 开始导入报告...")
    
    # Create directories if they don't exist
    IMPORT_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Look for .md files in import folder
    md_files = list(IMPORT_DIR.glob("*.md"))
    
    if not md_files:
        print(f"❌ 未在 {IMPORT_DIR} 发现 .md 文件。")
        print(f"💡 请将您的报告放在该文件夹中后再运行。")
        return

    # 2. Load existing index.json
    if INDEX_JSON.exists():
        with open(INDEX_JSON, 'r', encoding='utf-8') as f:
            try:
                reports_index = json.load(f)
            except json.JSONDecodeError:
                reports_index = []
    else:
        reports_index = []

    count = 0
    for md_path in md_files:
        print(f"📄 正在处理: {md_path.name}")
        
        with open(md_path, 'r', encoding='utf-8') as f:
            raw_content = f.read()
            
        # Sanitize promotional content
        content = sanitize_content(raw_content)
        
        title = extract_title(content, md_path.name)
        report_id = sanitize_id(md_path.name)
        today = datetime.now().strftime("%Y-%m-01") # Using month start as per existing format or YYYY-MM-DD
        
        # 3. Save sanitized file to data/reports/
        target_path = REPORTS_DIR / f"{report_id}.md"
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # 4. Update index.json metadata
        new_entry = {
            "id": report_id,
            "title": title,
            "date": today,
            "cover_image": f"images/{report_id}-hero.png" # Placeholder/Predictive path
        }
        
        # Check if already exists (avoid duplicates)
        existing_idx = next((i for i, r in enumerate(reports_index) if r['id'] == report_id), None)
        if existing_idx is not None:
            reports_index[existing_idx] = new_entry
            print(f"  🔄 已更新现有项: {report_id}")
        else:
            reports_index.insert(0, new_entry) # Add to top
            print(f"  ✅ 已添加新项: {report_id}")
        
        count += 1

    # 5. Save updated index.json
    with open(INDEX_JSON, 'w', encoding='utf-8') as f:
        json.dump(reports_index, f, ensure_ascii=False, indent=4)
    
    print(f"\n✨ 成功导入 {count} 份报告！")
    print(f"🔗 您可以通过 http://localhost:8008/report.html?id=[ID] 查看")
    
    # 6. Open the reports directory in Finder
    print(f"📂 正在打开文件夹...")
    os.system(f"open {REPORTS_DIR}")

if __name__ == "__main__":
    main()
