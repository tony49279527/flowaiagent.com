"""
Unified Payment Polling Server (SQLite Version)

Features:
1. Stores payment status in SQLite database (orders.db)
2. Provides /api/check_status for frontend polling
3. Provides /api/update_status for admin trigger
4. Auto-creates SQLite table on startup

Usage:
1. Run: python payment_server.py
2. Expose: ngrok http 8080
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import logging
from datetime import datetime
import os
import requests
import threading
import sqlite3
import json
import random
import time

# Serve static files from current directory
app = Flask(__name__)

ADMIN_API_TOKEN = os.environ.get('ADMIN_API_TOKEN')
cors_origins = [
    origin.strip()
    for origin in os.environ.get(
        'CORS_ORIGINS',
        'https://flowaiagent.com,http://localhost:4173,http://127.0.0.1:4173'
    ).split(',')
    if origin.strip()
]
if cors_origins:
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})
else:
    CORS(app)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_FILE = 'orders.db'

LOCALHOSTS = {'127.0.0.1', '::1'}

def is_admin_request():
    if ADMIN_API_TOKEN:
        token = request.headers.get('X-Admin-Token') or request.args.get('admin_token')
        return token == ADMIN_API_TOKEN
    return request.remote_addr in LOCALHOSTS

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def parse_order_id(raw_order_id):
    if raw_order_id is None:
        return None
    try:
        return int(str(raw_order_id).strip())
    except (TypeError, ValueError):
        return None

def init_db():
    try:
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                status TEXT NOT NULL DEFAULT 'PENDING',
                order_data TEXT,
                updated_at TEXT,
                email TEXT,
                quota_usage INTEGER DEFAULT 0
            )
        ''')
        # Initialize default row if not exists (for single-user demo)
        cur = conn.execute('SELECT * FROM orders WHERE id = 1')
        if not cur.fetchone():
            conn.execute("INSERT INTO orders (id, status, updated_at) VALUES (1, 'PENDING', ?)", (datetime.now().isoformat(),))
            logger.info("Initialized default order row.")
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"DB Init Error: {e}")

# Initialize DB on start
init_db()

@app.route('/')
def home():
    """Serve the Main Website Homepage"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Explicitly serve static files"""
    return send_from_directory('.', path)

@app.route('/api/check_quota', methods=['POST'])
def check_quota():
    """Check user quota (2 free uses)"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"allowed": False, "error": "Email required"}), 400

    try:
        conn = get_db_connection()
        # Check usage for this email
        row = conn.execute('SELECT quota_usage FROM orders WHERE email = ?', (email,)).fetchone()
        
        usage = 0
        if row:
            usage = row['quota_usage']
        else:
            # If no record, they have 0 usage. We might create a record or just return 0.
            # For simplicity, we just return the usage.
            pass
            
        conn.close()
        
        # Logic: Free quota is 2
        allowed = usage < 2
        return jsonify({"allowed": allowed, "usage": usage})
    except Exception as e:
        logger.error(f"Quota Check Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/check_status', methods=['GET'])
def check_status():
    """Frontend Endpoint to Poll Status"""
    order_id = parse_order_id(request.args.get('order_id'))
    
    try:
        conn = get_db_connection()
        if order_id is None:
            conn.close()
            return jsonify({"error": "order_id is required"}), 400

        row = conn.execute('SELECT status, updated_at FROM orders WHERE id = ?', (order_id,)).fetchone()
             
        conn.close()
        
        if row:
            return jsonify(dict(row))
        else:
            return jsonify({"status": "NOT_FOUND"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create_order', methods=['POST'])
def create_order():
    """Create a paid order that can later be manually confirmed by admin."""
    data = request.get_json(silent=True) or {}
    order_data = data.get('order_data', {})

    if not isinstance(order_data, dict):
        return jsonify({"error": "order_data must be an object"}), 400

    email = (order_data.get('user_email') or data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "user email is required"}), 400

    updated_at = datetime.now().isoformat()
    conn = get_db_connection()
    created_order_id = None
    try:
        for _ in range(5):
            candidate_order_id = int(f"{int(time.time() * 1000)}{random.randint(100, 999)}")
            try:
                conn.execute(
                    'INSERT INTO orders (id, status, updated_at, order_data, email) VALUES (?, ?, ?, ?, ?)',
                    (candidate_order_id, 'PENDING', updated_at, json.dumps(order_data), email)
                )
                conn.commit()
                created_order_id = candidate_order_id
                break
            except sqlite3.IntegrityError:
                continue

        if created_order_id is None:
            return jsonify({"error": "Failed to allocate order_id"}), 500

        logger.info(f"Created order {created_order_id} for {email}")
        return jsonify({"order_id": str(created_order_id), "status": "PENDING"}), 201
    except Exception as e:
        logger.error(f"Create Order Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# n8n Webhook URL for report generation
N8N_WEBHOOK_URL = 'https://tony4927.app.n8n.cloud/webhook/1573cd32-8e6a-46ac-9d74-1e6f7c9ea5e7'

def trigger_n8n_webhook(order_data):
    """Trigger n8n webhook to generate report"""
    try:
        logger.info(f"Triggering n8n webhook with data: {order_data}")
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=order_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        logger.info(f"n8n webhook response: {response.status_code} - {response.text[:200]}")
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Error triggering n8n webhook: {e}")
        return False

@app.route('/api/record_usage', methods=['POST'])
def record_usage():
    """Increment user usage count"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email required"}), 400

    try:
        conn = get_db_connection()
        # Check if user exists
        row = conn.execute('SELECT id, quota_usage FROM orders WHERE email = ?', (email,)).fetchone()
        
        if row:
            # Increment
            new_usage = row['quota_usage'] + 1
            conn.execute('UPDATE orders SET quota_usage = ? WHERE email = ?', (new_usage, email))
        else:
            # Create new user record
            conn.execute('INSERT INTO orders (email, quota_usage, status, updated_at) VALUES (?, 1, "PENDING", ?)', 
                         (email, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Record Usage Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update_status', methods=['POST'])
def update_status():
    """Admin Endpoint to Update Status and trigger webhook on SUCCESS"""
    if not is_admin_request():
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json(silent=True) or {}
    new_status = data.get('status')
    if new_status not in ['SUCCESS', 'FAILED', 'PENDING']:
        return jsonify({"error": "Invalid status"}), 400

    order_id = parse_order_id(data.get('order_id'))
    if order_id is None:
        return jsonify({"error": "order_id is required"}), 400

    provided_order_data = data.get('order_data')
    if provided_order_data is not None and not isinstance(provided_order_data, dict):
        return jsonify({"error": "order_data must be an object"}), 400

    updated_at = datetime.now().isoformat()
    try:
        conn = get_db_connection()
        row = conn.execute(
            'SELECT id, status, order_data, email FROM orders WHERE id = ?',
            (order_id,)
        ).fetchone()

        previous_status = None
        if row:
            previous_status = row['status']
            existing_order_data = {}
            if row['order_data']:
                try:
                    existing_order_data = json.loads(row['order_data'])
                except json.JSONDecodeError:
                    existing_order_data = {}

            final_order_data = provided_order_data if provided_order_data is not None else existing_order_data
            existing_email = row['email'] or final_order_data.get('user_email', '')
            conn.execute(
                'UPDATE orders SET status = ?, updated_at = ?, order_data = ?, email = ? WHERE id = ?',
                (new_status, updated_at, json.dumps(final_order_data), existing_email, order_id)
            )
        else:
            final_order_data = provided_order_data if provided_order_data is not None else {}
            final_email = final_order_data.get('user_email', '')
            conn.execute(
                'INSERT INTO orders (id, status, updated_at, order_data, email) VALUES (?, ?, ?, ?, ?)',
                (order_id, new_status, updated_at, json.dumps(final_order_data), final_email)
            )

        conn.commit()
        conn.close()

        logger.info(f"State Updated for Order {order_id}: {new_status}")

        should_trigger_webhook = (
            new_status == 'SUCCESS'
            and previous_status != 'SUCCESS'
            and bool(final_order_data)
        )
        if should_trigger_webhook:
            logger.info("Payment SUCCESS - Triggering n8n webhook...")
            thread = threading.Thread(target=trigger_n8n_webhook, args=(final_order_data,))
            thread.start()

        return jsonify({
            "message": "Status updated",
            "current_status": new_status,
            "order_id": str(order_id),
            "webhook_triggered": should_trigger_webhook
        })
    except Exception as e:
        logger.error(f"DB Update Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    logger.info(f"Starting Payment Polling Server (SQLite) on port {port}...")
    app.run(host='0.0.0.0', port=port)
