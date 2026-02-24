from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import threading
import uuid
import time
import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import requests # For OpenAI-style API calls if needed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DB_FILE = 'discovery_tasks.db'

# --- Configuration (To be provided by user via Env Vars) ---
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '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')
OPENAI_BASE_URL = os.environ.get('OPENAI_BASE_URL', 'https://openrouter.ai/api/v1')
DEFAULT_MODEL = os.environ.get('OPENAI_MODEL', 'anthropic/claude-3.5-sonnet')
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', 'leetony4927@gmail.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'yxscamljdghumpco')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', SMTP_USER)

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS discovery_tasks (
            task_id TEXT PRIMARY KEY,
            user_name TEXT,
            user_email TEXT,
            industry TEXT,
            form_data TEXT,
            status TEXT DEFAULT 'PENDING',
            report_content TEXT,
            error_message TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    conn.commit()
    conn.close()
    logger.info("Database initialized.")

init_db()

# --- AI Analysis & Email Logic ---

def generate_report(form_data):
    """
    Call AI API to generate the discovery report based on form data.
    """
    if not OPENAI_API_KEY:
        return "ERROR: OpenAI API Key not configured."

    model_to_use = form_data.get('ai_model', DEFAULT_MODEL)

    # Construct the Prompt
    prompt = f"""
    You are an expert Amazon Product Discovery Agent. 
    Analyze the following market discovery request and provide a detailed report in Markdown format.
    
    [Parameters]
    Main Category: {form_data.get('category_main')}
    Path: {form_data.get('category_path')}
    Keywords: {form_data.get('keywords')}
    Marketplace: {form_data.get('marketplace')}
    Focus Areas: {', '.join(form_data.get('focus_areas', []))}
    Target Price: ${form_data.get('target_price_min')} - ${form_data.get('target_price_max')}
    
    [Language Requirement]: 
    1. The report must be primarily in CHINESE (Simplified).
    2. Keep product keywords, specific Amazon terms, and customer quotes in their ORIGINAL language (e.g., English for US marketplace).
    
    [Report Structure]:
    1. Market Overview (Size, Satiation, Entry Barriers)
    2. Differentiation Gaps (Where can a new seller win?)
    3. Pricing Strategy (Optimal range based on competition)
    4. Strategic Recommendation (Go/No-go and proposed features)
    """

    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://flowaiagent.com", # Required by OpenRouter
            "X-Title": "FlowAI Agent"
        }
        payload = {
            "model": model_to_use,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        logger.info(f"Generating report using model: {model_to_use}")
        response = requests.post(f"{OPENAI_BASE_URL}/chat/completions", json=payload, headers=headers, timeout=180)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        logger.error(f"AI Generation Error: {e}")
        return f"ERROR: Failed to generate report. {str(e)}"

def send_email(to_email, user_name, report_content):
    """
    Send the generated report to the user's email.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP not configured. Skipping email.")
        return False

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email
    msg['Subject'] = f"Your Product Discovery Report for {user_name}"

    body = f"Hello {user_name},\n\nYour Amazon Product Discovery report is ready. Please see below:\n\n---\n\n{report_content}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Email Error: {e}")
        return False

def background_worker(task_id, user_name, user_email, form_data):
    """
    Background process to generate report and send email.
    """
    try:
        # Update status to ANALYZING
        conn = get_db_connection()
        conn.execute("UPDATE discovery_tasks SET status = ?, updated_at = ? WHERE task_id = ?", 
                     ('ANALYZING', datetime.now().isoformat(), task_id))
        conn.commit()

        # 1. Generate AI Report
        report = generate_report(form_data)
        
        if report.startswith("ERROR:"):
            raise Exception(report)

        # 2. Send Email
        email_sent = send_email(user_email, user_name, report)

        # 3. Final Update
        conn.execute("UPDATE discovery_tasks SET status = ?, report_content = ?, updated_at = ? WHERE task_id = ?", 
                     ('COMPLETED' if email_sent else 'COMPLETED_NO_EMAIL', report, datetime.now().isoformat(), task_id))
        conn.commit()
        conn.close()
        logger.info(f"Task {task_id} completed successfully.")

    except Exception as e:
        logger.error(f"Worker Error for task {task_id}: {e}")
        conn = get_db_connection()
        conn.execute("UPDATE discovery_tasks SET status = ?, error_message = ?, updated_at = ? WHERE task_id = ?", 
                     ('FAILED', str(e), datetime.now().isoformat(), task_id))
        conn.commit()
        conn.close()

# --- API Endpoints ---

@app.route('/api/discovery/submit', methods=['POST'])
def submit_task():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    task_id = str(uuid.uuid4())
    user_name = data.get('user_name', 'User')
    user_email = data.get('user_email', '')
    industry = data.get('industry', '')
    
    if not user_email:
        return jsonify({"error": "Email is required"}), 400

    # Store task in DB
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO discovery_tasks (task_id, user_name, user_email, industry, form_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (task_id, user_name, user_email, industry, json.dumps(data), 
          datetime.now().isoformat(), datetime.now().isoformat()))
    conn.commit()
    conn.close()

    # Start background worker
    thread = threading.Thread(target=background_worker, args=(task_id, user_name, user_email, data))
    thread.start()

    logger.info(f"Submitted discovery task {task_id} for {user_email}")
    return jsonify({"task_id": task_id, "status": "PENDING"}), 202

@app.route('/api/discovery/status', methods=['GET'])
def get_status():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({"error": "task_id required"}), 400

    conn = get_db_connection()
    row = conn.execute("SELECT status, error_message, updated_at FROM discovery_tasks WHERE task_id = ?", (task_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(dict(row))

if __name__ == '__main__':
    port = int(os.environ.get('DISCOVERY_PORT', 8081))
    logger.info(f"Discovery Server running on port {port}")
    app.run(host='0.0.0.0', port=port)
