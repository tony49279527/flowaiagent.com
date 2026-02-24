# FlowAI Agent - Product Discovery & Amazon Case Study Platform

This repository contains the frontend web application and the Python backend service for the **FlowAI Agent** Product Discovery feature. It has been structured so that any developer or AI coding assistant (like GitHub Copilot, Cursor, or Gemini) can clone the repository and reproduce the environment 100%.

## Project Structure

- **Frontend (`*.html`, `styles.css`, `js/`)**: Vanilla HTML/CSS/JS. No Node.js or Webpack build step is required.
- **Backend (`discovery_server.py`)**: A lightweight Flask web server that handles the Product Discovery AI API calls (via OpenRouter) and sends reports via SMTP email.
- **Data (`data/`)**: Contains JSON configurations mapping to markdown reports.

## 🚀 How to Reproduce & Run Locally

To get this project running on a new machine, follow these steps:

### 1. Frontend Development (Static Files)

Because the frontend is entirely static, you can use any local server to preview the site. For example:

```bash
# Using Python's built-in HTTP server:
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### 2. Backend Setup (Product Discovery Engine)

The Product Discovery tool requires a Python backend to handle secure API keys and email delivery.

**Prerequisites:** Python 3.9+ 

#### A. Install Dependencies

First, install the required Python packages defined in the lockfile:

```bash
pip install -r requirements.txt
```
*(This will install Flask, requests, python-dotenv, and flask-cors)*

#### B. Setup Environment Variables

For security, API keys and SMTP passwords are never committed to this repository. You must create a `.env.discovery` file in the root directory.

Run the following command or simply copy the template:
```bash
cp .env.example.discovery .env.discovery
```

Then, open `.env.discovery` and fill in your actual credentials:
- `OPENAI_API_KEY`: Your OpenRouter API Key (sk-or-v1-...)
- `SMTP_USER`: Your sender email address (e.g., your-email@gmail.com)
- `SMTP_PASSWORD`: Your 16-letter Gmail App Password (NOT your regular account password)

#### C. Run the Backend Server

Start the Flask server:
```bash
python3 discovery_server.py
```
*The server will start locally on `http://127.0.0.1:8081`.*

Once the backend is running, the frontend `discovery.html` form will automatically route requests to `http://localhost:8081/api/discovery/submit`.

### Important Notes for AI Coding Assistants (Vibe Coding)

If you are an AI assistant analyzing this repository:
1. **Never** hardcode credentials like API keys or App Passwords in the python code. Always rely on the `os.environ.get()` logic combined with `python-dotenv`.
2. Do not mutate the `discovery_tasks.db` schema directly unless a formal migration is written.
3. The `.env.discovery` and `*.db` files are ignored by `.gitignore` to prevent secret leaks. All configuration variables should be added to `.env.example.discovery` for documentation.
