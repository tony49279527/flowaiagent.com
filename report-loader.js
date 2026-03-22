/**
 * report-loader.js - Universal Report Rendering System
 * Loads Markdown content dynamically and handles TOC/UI.
 */

function escapeHtmlText(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
}

function escapeHtmlAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function slugFromHeading(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
}

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (!reportId) {
        console.error('No report ID provided in URL.');
        return;
    }

    updateLanguageLinks(reportId);
    loadReport(reportId);
});

function updateLanguageLinks(reportId) {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('id', reportId);
    const reportQuery = currentParams.toString();

    document.querySelectorAll('a.lang-btn[href="report.html"], a.mobile-nav-link[href="report.html"]').forEach(function (link) {
        link.href = 'report.html?' + reportQuery;
    });
    document.querySelectorAll('a.lang-btn[href="report_en.html"], a.mobile-nav-link[href="report_en.html"]').forEach(function (link) {
        link.href = 'report_en.html?' + reportQuery;
    });
}

async function loadReport(id) {
    const reportBody = document.getElementById('report-body');
    const reportTitle = document.getElementById('dynamic-title');
    const reportDate = document.getElementById('dynamic-date');
    const reportCategory = document.getElementById('dynamic-category');
    const tocContainer = document.getElementById('toc-container');
    const isEnglish = window.location.pathname.includes('_en.html') || new URLSearchParams(window.location.search).get('lang') === 'en';

    try {
        // 1. Fetch metadata to get the title
        const jsonPath = isEnglish ? 'data/reports/index_en.json' : 'data/reports/index.json';
        const metadataResponse = await fetch(`${jsonPath}?v=` + new Date().getTime());
        const metadataList = await metadataResponse.json();
        const metadata = metadataList.find(r => r.id === id);

        if (metadata) {
            reportTitle.textContent = metadata.title;
            reportDate.textContent = (isEnglish ? 'Generated on: ' : '生成时间：') + metadata.date;
            if (reportCategory) {
                reportCategory.lastChild.textContent = isEnglish ? 'Competitor Report' : '分析报告';
            }
            document.title = metadata.title + ' | FlowAI Agent';
        }

        // 2. Fetch Markdown content
        const contentResponse = await fetch(`data/reports/${encodeURIComponent(id)}.md`);
        if (!contentResponse.ok) throw new Error('Report content not found');
        const markdown = await contentResponse.text();

        // 3. Render Markdown
        if (typeof marked === 'undefined') {
            console.error('marked.js not loaded');
            reportBody.textContent = '';
            const p = document.createElement('p');
            p.textContent = isEnglish ? 'Error: Markdown renderer not available.' : '错误：Markdown 渲染器不可用。';
            reportBody.appendChild(p);
            return;
        }

        const renderer = new marked.Renderer();
        renderer.heading = function (arg1, arg2) {
            let text = '', level = 1;
            if (typeof arg1 === 'object' && arg1 !== null) {
                text = arg1.text || '';
                level = arg1.depth || 1;
            } else {
                text = arg1 || '';
                level = arg2 || 1;
            }
            const safeText = String(text || '');
            const idSlug = escapeHtmlAttr(slugFromHeading(safeText));
            return `<h${level} id="${idSlug}" style="scroll-margin-top: 100px;">${escapeHtmlText(safeText)}</h${level}>`;
        };

        const rawHtml = marked.parse(markdown, { renderer: renderer });
        if (typeof DOMPurify !== 'undefined') {
            reportBody.innerHTML = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        } else {
            console.warn('DOMPurify not loaded; rendering escaped plain preview only');
            reportBody.textContent = '';
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.textContent = markdown;
            reportBody.appendChild(pre);
        }

        // 4. Generate TOC
        generateTOC(reportBody, tocContainer);

        // 5. Setup Features (PDF, Share)
        setupFeatures(metadata || { title: '分析报告', id: id });

    } catch (error) {
        console.error('Failed to load report:', error);
        reportBody.textContent = '';
        const wrap = document.createElement('div');
        wrap.style.color = 'red';
        wrap.style.padding = '20px';
        const p = document.createElement('p');
        p.textContent = (isEnglish ? 'Sorry, the report failed to load: ' : '抱歉，报告加载失败：') + (error && error.message ? error.message : String(error));
        wrap.appendChild(p);
        if (error && error.stack) {
            const small = document.createElement('small');
            small.style.display = 'block';
            small.style.marginTop = '8px';
            small.style.whiteSpace = 'pre-wrap';
            small.textContent = error.stack;
            wrap.appendChild(small);
        }
        reportBody.appendChild(wrap);
    }

    // 6. Load Recommended Reports
    if (typeof loadRecommended === 'function') {
        loadRecommended(id);
    }
}

async function loadRecommended(currentId) {
    const container = document.getElementById('recommended-grid');
    if (!container) return;

    try {
        const isEnglish = window.location.pathname.includes('_en.html') || new URLSearchParams(window.location.search).get('lang') === 'en';
        const jsonPath = isEnglish ? 'data/reports/index_en.json' : 'data/reports/index.json';
        const response = await fetch(`${jsonPath}?v=` + new Date().getTime());
        const reports = await response.json();

        const others = reports.filter(r => r.id !== currentId);
        const shuffled = others.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const reportPage = isEnglish ? 'report_en.html' : 'report.html';
        container.textContent = '';

        selected.forEach(report => {
            const rid = report.id != null ? String(report.id) : '';
            const title = report.title != null ? String(report.title) : '';
            const dateStr = report.date != null ? String(report.date) : '';
            const cover = report.cover_image && /^[\w./-]+$/i.test(String(report.cover_image))
                ? String(report.cover_image)
                : 'images/default-hero.png';

            const a = document.createElement('a');
            a.href = `${reportPage}?id=${encodeURIComponent(rid)}`;
            a.className = 'recommendation-card';

            const imgWrap = document.createElement('div');
            imgWrap.className = 'rec-card-image';
            const img = document.createElement('img');
            img.src = cover;
            img.alt = title;
            img.onerror = function () { this.src = 'images/cat-litter-box-hero.png'; };
            imgWrap.appendChild(img);

            const content = document.createElement('div');
            content.className = 'rec-card-content';
            const h4 = document.createElement('h4');
            h4.className = 'rec-card-title';
            h4.textContent = title;
            const dateEl = document.createElement('div');
            dateEl.className = 'rec-card-date';
            dateEl.textContent = dateStr;
            content.appendChild(h4);
            content.appendChild(dateEl);

            a.appendChild(imgWrap);
            a.appendChild(content);
            container.appendChild(a);
        });

        if (selected.length === 0) {
            const section = document.getElementById('recommended-section');
            if (section) section.style.display = 'none';
        }

    } catch (e) {
        console.error('Failed to load recommended:', e);
    }
}

function setupFeatures(data) {
    const downloadBtn = document.getElementById('download-pdf');
    const shareBtn = document.getElementById('share-report');
    const modal = document.getElementById('share-modal-overlay');
    const closeBtn = document.getElementById('close-share');
    const copyBtn = document.getElementById('copy-btn');
    const shareUrlInput = document.getElementById('share-url');
    const isEnglish = window.location.pathname.includes('_en.html') || new URLSearchParams(window.location.search).get('lang') === 'en';

    // PDF Download
    if (downloadBtn) {
        // Remove old inline onclick if exists
        downloadBtn.removeAttribute('onclick');
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert(
                isEnglish
                    ? 'Please add official WeChat: tony49279527 to get the high-res PDF version of this report.'
                    : '请添加官方微信客服：tony49279527，获取本报告的高清 PDF 版本。'
            );
        });
    }

    // Share Functionality
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const currentUrl = window.location.href;
            shareUrlInput.value = currentUrl;

            // Generate QR Code
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: currentUrl,
                width: 180,
                height: 180,
                colorDark: "#2c3e50",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Native Share API if available (for mobile)
            if (navigator.share) {
                navigator.share({
                    title: data.title,
                    text: isEnglish
                        ? 'Check out this in-depth competitor analysis report generated by FlowAI Agent.'
                        : '查看这份由 FlowAI Agent 生成的深入竞品分析报告',
                    url: currentUrl,
                }).catch(err => {
                    console.log('Share error:', err);
                    modal.classList.add('active'); // fallback
                });
            } else {
                modal.classList.add('active');
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            shareUrlInput.select();
            document.execCommand('copy');
            copyBtn.textContent = isEnglish ? 'Copied' : '已复制';
            setTimeout(() => {
                copyBtn.textContent = isEnglish ? 'Copy' : '复制';
            }, 2000);
        });
    }

    // Close modal on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

function generateTOC(contentEl, tocEl) {
    if (!tocEl) return;

    const headings = contentEl.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        tocEl.parentElement.style.display = 'none';
        return;
    }

    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    headings.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1));
        const li = document.createElement('li');
        li.className = `toc-item toc-level-${level}`;

        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            const targetElement = document.getElementById(heading.id);
            if (targetElement) {
                const offset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jump
                history.pushState(null, null, '#' + heading.id);
            }
        });

        li.appendChild(a);
        tocList.appendChild(li);
    });

    tocEl.innerHTML = ''; // Already has "报告目录" in HTML
    tocEl.appendChild(tocList);

    // Initial highlight
    setupScrollSpy(headings);

    // Progress Bar
    window.addEventListener('scroll', updateProgressBar);
}

function setupScrollSpy(headings) {
    const tocLinks = document.querySelectorAll('.toc-list a');

    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                        // Ensure active item is visible in sidebar
                        link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    }
                });
            }
        });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));
}

function updateProgressBar() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
}
