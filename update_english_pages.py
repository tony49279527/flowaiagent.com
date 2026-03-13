import os
import re

# Files to exclude (already updated)
EXCLUDED = [
    'index_en.html',
    'create_en.html',
    'success_en.html',
    'report_en.html',
    'blog_backup_en.html'
]

# Base directory
BASE_DIR = r'c:\Users\sales-Tony\.gemini\antigravity\playground\vector-apogee'

# New Header Template
HEADER_TEMPLATE = """        <header class="main-header">
            <a href="index_en.html" class="logo-link">
                <div class="logo-section">
                    <div class="logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-bot">
                            <path d="M12 8V4H8" />
                            <rect width="16" height="12" x="4" y="8" rx="2" />
                            <path d="M2 14h2" />
                            <path d="M20 14h2" />
                            <path d="M15 13v2" />
                            <path d="M9 13v2" />
                        </svg>
                    </div>
                <span class="logo-text">FlowAI Agent <span class="logo-sub">Amazon Analysis Platform</span></span>
                </div>
            </a>
            <nav class="main-nav" id="mainNav">
                <a href="index_en.html" class="nav-link {HOME_ACTIVE}">Home</a>
                <a href="create_en.html" class="nav-link {CREATE_ACTIVE}">Create Analysis</a>
                <a href="cases_en.html" class="nav-link {CASES_ACTIVE}">Case Studies</a>
                <a href="blog_en.html" class="nav-link {BLOG_ACTIVE}">Blog</a>
            </nav>
            <div class="header-right">
                <div class="lang-switch">
                    <a href="{LANG_LINK}" class="lang-btn">🇨🇳 CN</a>
                </div>
                <button class="hamburger-btn" id="hamburgerBtn" aria-label="Menu" aria-expanded="false">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        </header>

        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay">
            <nav class="mobile-nav">
                <a href="index_en.html" class="mobile-nav-link {M_HOME_ACTIVE}">Home</a>
                <a href="create_en.html" class="mobile-nav-link {M_CREATE_ACTIVE}">Create Analysis</a>
                <a href="cases_en.html" class="mobile-nav-link {M_CASES_ACTIVE}">Case Studies</a>
                <a href="blog_en.html" class="mobile-nav-link {M_BLOG_ACTIVE}">Blog</a>
                <a href="{LANG_LINK}" class="mobile-nav-link">🇨🇳 Chinese</a>
            </nav>
        </div>"""

# New Footer Template
FOOTER_TEMPLATE = """        <!-- Footer -->
        <footer class="main-footer enhanced-footer">
            <div class="footer-content">
                <div class="footer-section footer-brand">
                    <div class="footer-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        <span>FlowAI Agent</span>
                    </div>
                    <p class="footer-tagline">AI Driven Amazon Competitor Analysis Platform</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="index_en.html">Home</a></li>
                        <li><a href="create_en.html">Create Analysis</a></li>
                        <li><a href="cases_en.html">Case Studies</a></li>
                        <li><a href="blog_en.html">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact Us</h4>
                    <ul class="footer-links">
                        <li>📧 contact@amzaiagent.com</li>
                        <li>💬 WeChat: tony49279527</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 FlowAI Agent - Data Driven Decisions</p>
                <div class="footer-legal">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </footer>"""

# Script to inject
SCRIPT_CONTENT = """    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Hamburger Menu
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

            if (hamburgerBtn && mobileMenuOverlay) {
                hamburgerBtn.addEventListener('click', function () {
                    hamburgerBtn.classList.toggle('active');
                    mobileMenuOverlay.classList.toggle('active');
                    document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
                    hamburgerBtn.setAttribute('aria-expanded', mobileMenuOverlay.classList.contains('active'));
                });

                mobileMenuOverlay.querySelectorAll('.mobile-nav-link').forEach(link => {
                    link.addEventListener('click', function () {
                        hamburgerBtn.classList.remove('active');
                        mobileMenuOverlay.classList.remove('active');
                        document.body.style.overflow = '';
                    });
                });
            }
        });
    </script>"""

def process_file(file_path):
    print(f"Processing: {os.path.basename(file_path)}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract Language Link
    lang_match = re.search(r'<a href="([^"]+)" class="lang-btn">', content)
    lang_link = lang_match.group(1) if lang_match else "index.html"
    
    # 2. Extract Active Nav Link
    home_active = "active" if 'class="nav-link active">Home' in content else ""
    create_active = "active" if 'class="nav-link active">Create' in content else ""
    cases_active = "active" if 'class="nav-link active">Case' in content else ""
    blog_active = "active" if 'class="nav-link active">Blog' in content else ""
    
    # Also handle the format: <a href="..." class="nav-link active">
    if not any([home_active, create_active, cases_active, blog_active]):
         if 'href="index_en.html" class="nav-link active"' in content: home_active = "active"
         elif 'href="create_en.html" class="nav-link active"' in content: create_active = "active"
         elif 'href="cases_en.html" class="nav-link active"' in content: cases_active = "active"
         # Blog detail pages usually have Blog active
         elif 'href="blog_en.html" class="nav-link active"' in content: blog_active = "active"
         elif 'blog' in file_path and 'template' not in file_path: blog_active = "active" # Assumption for detail pages

    # 3. Prepare Header
    header = HEADER_TEMPLATE.replace("{LANG_LINK}", lang_link)
    header = header.replace("{HOME_ACTIVE}", home_active)
    header = header.replace("{CREATE_ACTIVE}", create_active)
    header = header.replace("{CASES_ACTIVE}", cases_active)
    header = header.replace("{BLOG_ACTIVE}", blog_active)
    
    # Mobile Active States
    header = header.replace("{M_HOME_ACTIVE}", home_active)
    header = header.replace("{M_CREATE_ACTIVE}", create_active)
    header = header.replace("{M_CASES_ACTIVE}", cases_active)
    header = header.replace("{M_BLOG_ACTIVE}", blog_active)

    # 4. Replace Header
    # Regex to capture <header ...> ... </header>
    # Note: re.DOTALL matches newlines
    content = re.sub(r'<header class="main-header">.*?</header>', header, content, flags=re.DOTALL)
    
    # Remove any existing mobile menu overlay if present (to avoid dupe)
    content = re.sub(r'<div class="mobile-menu-overlay".*?</div>', '', content, flags=re.DOTALL)
    # But wait, my header template includes the overlay! So I just need to replace Header active area.
    # Actually, my HEADER_TEMPLATE *includes* the overlay div after the header closing tag.
    # This might be tricky if the original file layout is strict. 
    # Let's adjust: REPLACE Header with Header + Overlay. 
    # Just need to make sure I don't leave an orphan Overlay if I run the script twice.
    # The regex above replaces <header>...</header>. The template inserts <header>...</header>...<div overlay>...</div>
    # So if run twice, it would look for <header>...</header> again.
    
    # 5. Replace Footer
    content = re.sub(r'<footer class="main-footer">.*?</footer>', FOOTER_TEMPLATE, content, flags=re.DOTALL)
    content = re.sub(r'<footer class="main-footer enhanced-footer">.*?</footer>', FOOTER_TEMPLATE, content, flags=re.DOTALL)

    # 6. Inject Script
    # Check if script already exists
    if "const hamburgerBtn = document.getElementById('hamburgerBtn');" not in content:
        content = content.replace('</body>', f'{SCRIPT_CONTENT}\n</body>')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    files = [f for f in os.listdir(BASE_DIR) if f.endswith('_en.html') and f not in EXCLUDED]
    for file in files:
        full_path = os.path.join(BASE_DIR, file)
        process_file(full_path)
    print("Batch update complete.")

if __name__ == "__main__":
    main()
