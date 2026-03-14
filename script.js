
// Function to fill the custom prompt textarea
function fillPrompt(text) {
    const promptArea = document.getElementById('custom-prompt');
    if (promptArea) {
        promptArea.value = text;
        // Optional: Highlight effect to show it was filled
        promptArea.style.borderColor = 'var(--primary-color)';
        setTimeout(() => {
            promptArea.style.borderColor = 'var(--border-color)';
        }, 500);
    }
}

// Helper to read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Multi-file Upload Handling
// Store files in a Map so we can add/remove individually
const multiFileStores = {};

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function setupMultiFileUpload(inputId, listId, clearBtnId) {
    const fileInput = document.getElementById(inputId);
    const fileListEl = document.getElementById(listId);
    const clearBtn = document.getElementById(clearBtnId);

    if (!fileInput || !fileListEl) return;

    // Initialize store for this upload
    multiFileStores[inputId] = [];

    function renderFileList() {
        const files = multiFileStores[inputId];
        fileListEl.innerHTML = '';

        if (clearBtn) {
            clearBtn.style.display = files.length > 0 ? 'inline-block' : 'none';
        }

        files.forEach(function (file, index) {
            const item = document.createElement('div');
            item.className = 'file-list-item';
            item.innerHTML =
                '<span class="file-item-name" title="' + file.name + '">' + file.name + '</span>' +
                '<span class="file-item-size">' + formatFileSize(file.size) + '</span>' +
                '<button type="button" class="remove-file-btn" title="删除此文件">&times;</button>';

            item.querySelector('.remove-file-btn').addEventListener('click', function () {
                multiFileStores[inputId].splice(index, 1);
                renderFileList();
            });

            fileListEl.appendChild(item);
        });
    }

    fileInput.addEventListener('change', function () {
        if (this.files && this.files.length > 0) {
            // Append new files to existing list
            for (var i = 0; i < this.files.length; i++) {
                // Avoid duplicates by name+size
                var f = this.files[i];
                var exists = multiFileStores[inputId].some(function (existing) {
                    return existing.name === f.name && existing.size === f.size;
                });
                if (!exists) {
                    multiFileStores[inputId].push(f);
                }
            }
            renderFileList();
        }
        // Reset input so same file can be re-selected
        this.value = '';
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            multiFileStores[inputId] = [];
            renderFileList();
        });
    }
}

setupMultiFileUpload('csv-upload', 'csv-file-list', 'csv-clear-all');
setupMultiFileUpload('persona-upload', 'persona-file-list', 'persona-clear-all');


// Modal and Form Handling
document.addEventListener('DOMContentLoaded', function () {
    const analysisForm = document.getElementById('analysisForm');
    const submitBtn = document.getElementById('submitBtn'); // The button in the main form

    // --- FAQ Accordion Logic (runs on all pages) ---
    const faqHeaders = document.querySelectorAll('.faq-accordion-header');
    faqHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = this.parentElement;
            const content = item.querySelector('.faq-accordion-content');

            // Close all other items
            document.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-accordion-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');

            if (item.classList.contains('active')) {
                if (content) content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                if (content) content.style.maxHeight = null;
            }
        });
    });

    if (!analysisForm || !submitBtn) return;

    async function refreshCompetitorQuotaBanner() {
        const banner = document.querySelector('.quota-banner[data-feature="competitor"]');
        if (!banner) return;

        const storedEmail = (localStorage.getItem('user_email') || localStorage.getItem('userEmail') || '').trim().toLowerCase();
        if (!storedEmail) return;

        const isEnglish = document.documentElement.lang === 'en';
        try {
            const resp = await fetch('/api/check_quota', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: storedEmail, feature: 'competitor' })
            });
            if (!resp.ok) return;
            const data = await resp.json();
            if (data.remaining > 0) {
                banner.textContent = isEnglish
                    ? `🎁 Competitor Analysis: ${data.remaining} free credits remaining`
                    : `🎁 竞品分析额度：当前还剩 ${data.remaining} 次免费机会`;
            } else {
                banner.textContent = isEnglish
                    ? '🎁 Competitor Analysis: your 2 free credits are fully used'
                    : '🎁 竞品分析额度：您的 2 次免费机会已全部使用';
            }
        } catch (e) {
            console.warn('Quota banner refresh failed:', e);
        }
    }

    refreshCompetitorQuotaBanner();

    function validateAsinList(raw, fieldName) {
        const parts = raw.split(/[\n\r,;]+/).map(s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')).filter(Boolean);
        const valid = parts.filter(p => p.length === 10 && p.startsWith('B0'));
        const invalid = parts.filter(p => p.length !== 10 || !p.startsWith('B0'));
        return { valid: valid, invalidCount: invalid.length, invalid: invalid };
    }

    // Clear ASIN errors on input
    const mainAsinEl = document.getElementById('main-asin');
    const compAsinEl = document.getElementById('comp-asin');
    if (mainAsinEl) mainAsinEl.addEventListener('input', function () { const e = document.getElementById('main-asin-error'); if (e) e.style.display = 'none'; });
    if (compAsinEl) compAsinEl.addEventListener('input', function () { const e = document.getElementById('comp-asin-error'); if (e) e.style.display = 'none'; });

    // Handle form submission after contact fields were moved inline.
    analysisForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission

        const mainAsin = document.getElementById('main-asin').value.trim();
        const compAsin = document.getElementById('comp-asin').value.trim();
        const selectedLanguage = (document.querySelector('#analysisForm select[name="language"]') || {}).value || 'zh';

        if (!mainAsin || !compAsin) {
            alert(selectedLanguage === 'en' ? 'Please fill in required ASIN fields.' : '请填写必填的 ASIN 字段。');
            return;
        }

        const mainResult = validateAsinList(mainAsin, 'main');
        const compResult = validateAsinList(compAsin, 'comp');

        const mainErr = document.getElementById('main-asin-error');
        const compErr = document.getElementById('comp-asin-error');
        if (mainErr) mainErr.style.display = 'none';
        if (compErr) compErr.style.display = 'none';

        if (mainResult.valid.length === 0) {
            const msg = selectedLanguage === 'en' ? 'Please enter a valid ASIN (10 alphanumeric chars starting with B0, e.g. B08N5WRWNW)' : '请输入有效的 ASIN（以 B0 开头的 10 位编码）';
            if (mainErr) { mainErr.textContent = msg; mainErr.style.display = 'block'; }
            return;
        }
        if (compResult.valid.length === 0) {
            const msg = selectedLanguage === 'en' ? 'Please enter at least one valid Competitor ASIN (10 alphanumeric chars starting with B0)' : '请至少输入一个有效的竞品 ASIN（以 B0 开头的 10 位编码）';
            if (compErr) { compErr.textContent = msg; compErr.style.display = 'block'; }
            return;
        }
        if (mainResult.invalidCount > 0 || compResult.invalidCount > 0) {
            const msg = selectedLanguage === 'en'
                ? `${mainResult.invalidCount + compResult.invalidCount} invalid ASIN(s) were ignored. Each ASIN must be 10 alphanumeric characters starting with B0.`
                : `已忽略 ${mainResult.invalidCount + compResult.invalidCount} 个无效 ASIN。每个 ASIN 需为以 B0 开头的 10 位编码。`;
            if (!confirm(msg + (selectedLanguage === 'en' ? ' Continue?' : ' 是否继续？'))) return;
        }

        const userNameInput = document.getElementById('userName');
        const userEmailInput = document.getElementById('userEmail');
        const industryInput = document.getElementById('industry');
        
        if (!userNameInput || !userNameInput.value.trim() || !userEmailInput || !userEmailInput.value.trim() || !industryInput || !industryInput.value.trim()) {
            alert(selectedLanguage === 'en' ? 'Please fill in all contact information fields.' : '请填写所有联系信息字段。');
            return;
        }

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state immediately to prevent double clicks
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';

        const userEmail = userEmailInput.value.trim().toLowerCase();

        try {
            const mainFormData = new FormData(analysisForm);
            const rawData = {};
            for (let [key, value] of mainFormData.entries()) {
                if (value instanceof File) continue;
                rawData[key] = value;
            }

            if (rawData.userEmail) {
                const normalizedEmail = rawData.userEmail.trim().toLowerCase();
                localStorage.setItem('user_email', normalizedEmail);
                localStorage.setItem('userEmail', normalizedEmail);
            }

            const buildOrderData = () => {
                const normalizedEmail = (rawData.userEmail || '').trim().toLowerCase();
                const mainAsins = rawData.mainAsin ? rawData.mainAsin.split('\n').map(s => s.trim()).filter(s => s) : [];
                const competitorAsins = rawData.compAsin ? rawData.compAsin.split('\n').map(s => s.trim()).filter(s => s) : [];
                const submittedAt = new Date().toISOString();
                return {
                    source: 'create-analysis',
                    analysis_type: 'competitor_analysis',
                    report_type: 'paid_manual_confirm',
                    submitted_at: submittedAt,

                    user_name: rawData.userName || '',
                    userName: rawData.userName || '',
                    name: rawData.userName || '',

                    user_email: normalizedEmail,
                    userEmail: normalizedEmail,
                    email: normalizedEmail,

                    industry: rawData.industry || '',

                    main_asins: mainAsins,
                    mainAsins: mainAsins,
                    competitor_asins: competitorAsins,
                    competitorAsins: competitorAsins,

                    language: rawData.language || 'zh',
                    custom_prompt: rawData.customPrompt || '',
                    customPrompt: rawData.customPrompt || '',
                    reference_site_count: parseInt(rawData.siteCount) || 10,
                    referenceSiteCount: parseInt(rawData.siteCount) || 10,
                    reference_youtube_count: parseInt(rawData.youtubeCount) || 10,
                    referenceYoutubeCount: parseInt(rawData.youtubeCount) || 10
                };
            };

            async function redirectToPayment() {
                const createOrderRes = await fetch('/api/create_order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: (rawData.userEmail || '').trim().toLowerCase(),
                        order_data: buildOrderData()
                    })
                });
                if (!createOrderRes.ok) {
                    throw new Error('Failed to create order before payment');
                }
                const createOrderData = await createOrderRes.json();
                window.location.href = 'payment.html?order_id=' + encodeURIComponent(createOrderData.order_id);
            }

            // --- Server-Side Quota Check with Client-Side Fallback ---
            let useLocalQuotaFallback = false;
            let localUsageKey = '';
            let localUsage = 0;
            if (userEmail) {
                let quotaData = { allowed: true, usage: 0, remaining: 2, feature: 'competitor' };
                try {
                    const quotaResponse = await fetch('/api/check_quota', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail, feature: 'competitor' })
                    });
                    if (quotaResponse.ok) {
                        quotaData = await quotaResponse.json();
                    } else {
                        throw new Error('Backend not reachable');
                    }
                } catch (e) {
                    console.log('Backend unreachable, using client-side demo quota.');
                    // Fallback to localStorage for Demo Mode
                    useLocalQuotaFallback = true;
                    localUsageKey = 'flowai_usage_competitor_' + userEmail;
                    localUsage = parseInt(localStorage.getItem(localUsageKey) || '0');
                    quotaData = { allowed: localUsage < 2, usage: localUsage, remaining: Math.max(0, 2 - localUsage), feature: 'competitor' };
                }

                if (!quotaData.allowed) {
                    const quotaExceededMessage = (rawData.language === 'en')
                        ? 'Your 2 free deep-analysis credits are used up. Redirecting to payment.'
                        : '您的 2 次免费深度分析额度已用完，正在跳转到支付页面。';
                    alert(quotaExceededMessage);
                    await redirectToPayment();
                    return; // Stop execution
                }

                console.log(`User ${userEmail} quota check passed. Usage: ${quotaData.usage}`);
            }
            // -------------------------------

            // Handle Multi-file Content Reading
            const csvFiles = (multiFileStores && multiFileStores['csv-upload']) || [];
            const personaFiles = (multiFileStores && multiFileStores['persona-upload']) || [];

            let csvContents = [];
            let personaContents = [];

            for (let i = 0; i < csvFiles.length; i++) {
                const content = await readFileAsText(csvFiles[i]);
                csvContents.push({ filename: csvFiles[i].name, content: content });
            }

            for (let i = 0; i < personaFiles.length; i++) {
                const content = await readFileAsText(personaFiles[i]);
                personaContents.push({ filename: personaFiles[i].name, content: content });
            }

            // Bilingual Language Strategy: Main Chinese, Auxiliary Marketplace Language
            const isChinese = (rawData.language === 'zh');
            let finalPrompt = rawData.customPrompt || '';

            if (isChinese) {
                const langInstruction = "\n\n[Language Requirement]: \n1. 整体报告必须以中文（简体）撰写，确保叙述逻辑符合中国卖家的阅读习惯。\n2. 亚马逊站点的原始关键词、应用场景词、用户原话引用以及特定术语，请保留原始语言（英文/德文/日文等）或采用中外文对照形式，以确保数据分析的精准性和专业度。";
                finalPrompt += langInstruction;
            }

            // Construct the final payload with correct keys and types
            const normalizedEmail = (rawData.userEmail || '').trim().toLowerCase();
            const mainAsins = rawData.mainAsin ? rawData.mainAsin.split('\n').map(s => s.trim()).filter(s => s) : [];
            const competitorAsins = rawData.compAsin ? rawData.compAsin.split('\n').map(s => s.trim()).filter(s => s) : [];
            const submittedAt = new Date().toISOString();
            const payload = {
                source: 'create-analysis',
                analysis_type: 'competitor_analysis',
                report_type: 'competitor_analysis',
                submitted_at: submittedAt,

                user_name: rawData.userName,
                userName: rawData.userName,
                name: rawData.userName,

                user_email: normalizedEmail,
                userEmail: normalizedEmail,
                email: normalizedEmail,

                industry: rawData.industry,

                main_asins: mainAsins,
                mainAsins: mainAsins,
                competitor_asins: competitorAsins,
                competitorAsins: competitorAsins,

                language: rawData.language,
                custom_prompt: finalPrompt,
                customPrompt: finalPrompt,
                reference_site_count: parseInt(rawData.siteCount) || 10,
                referenceSiteCount: parseInt(rawData.siteCount) || 10,
                reference_youtube_count: parseInt(rawData.youtubeCount) || 10,
                referenceYoutubeCount: parseInt(rawData.youtubeCount) || 10,

                review_doc_link: "",
                reviewDocLink: "",
                csv_file_url: csvContents.length === 1 ? csvContents[0].content : "",
                csvFileUrl: csvContents.length === 1 ? csvContents[0].content : "",
                csv_files: csvContents,
                csvFiles: csvContents,
                persona_file_url: personaContents.length === 1 ? personaContents[0].content : "",
                personaFileUrl: personaContents.length === 1 ? personaContents[0].content : "",
                persona_files: personaContents,
                personaFiles: personaContents,
                analysis_id: "",
                analysisId: ""
            };

            // Show Progress Overlay
            const progressOverlay = document.getElementById('progressOverlay');
            const progressBar = document.getElementById('progressBar');
            const progressStatus = document.getElementById('progressStatus');

            if (progressOverlay) {
                progressOverlay.classList.add('active');

                // Simulate Progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 10;
                    if (progress > 90) progress = 90; // Hold at 90% until done

                    if (progressBar) progressBar.style.width = `${progress}%`;

                    // Update status text based on progress
                    if (progress < 30) {
                        progressStatus.textContent = (rawData.language === 'en') ? 'Connecting to Amazon API...' : '连接亚马逊数据接口...';
                    } else if (progress < 60) {
                        progressStatus.textContent = (rawData.language === 'en') ? 'Analyzing Competitor Data...' : '正在分析竞品数据...';
                    } else {
                        progressStatus.textContent = (rawData.language === 'en') ? 'Generating Report...' : '正在生成分析报告...';
                    }
                }, 500);

                // Send to backend proxy with server-side quota enforcement
                let response;
                try {
                    response = await fetch('/api/competitor/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (e) {
                    console.warn('Webhook network error:', e);
                    clearInterval(interval);
                    if (progressBar) progressBar.style.width = '0%';
                    progressStatus.textContent = (rawData.language === 'en')
                        ? 'Network error. Please retry.'
                        : '网络异常，请重试。';
                    if (progressOverlay) progressOverlay.classList.remove('active');
                    alert((rawData.language === 'en')
                        ? 'Network error. Please retry your submission.'
                        : '网络异常，请重试提交。');
                    return;
                }

                if (!response.ok) {
                    let errorData = null;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = null;
                    }
                    clearInterval(interval);
                    progressStatus.textContent = (rawData.language === 'en')
                        ? 'Submission failed. Please retry.'
                        : '提交失败，请重试。';
                    if (progressOverlay) progressOverlay.classList.remove('active');

                    if (response.status === 403) {
                        const quotaExceededMessage = (rawData.language === 'en')
                            ? 'Your 2 free deep-analysis credits are used up. Redirecting to payment.'
                            : '您的 2 次免费深度分析额度已用完，正在跳转到支付页面。';
                        alert(quotaExceededMessage);
                        await redirectToPayment();
                        return;
                    }

                    alert((rawData.language === 'en')
                        ? 'Submission failed. Please retry.'
                        : '提交失败，请重试。');
                    return;
                }

                clearInterval(interval);
                if (progressBar) progressBar.style.width = '100%';
                progressStatus.textContent = (rawData.language === 'en') ? 'Analysis Complete!' : '分析完成！';

                if (useLocalQuotaFallback && localUsageKey) {
                    localStorage.setItem(localUsageKey, String(localUsage + 1));
                }

                setTimeout(() => {
                    // Redirect to success page
                    window.location.href = (rawData.language === 'en') ? 'success_en.html?type=competitor' : 'success.html?type=competitor';
                }, 1000);

            } else {
                try {
                    const fallbackRes = await fetch('/api/competitor/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                    if (fallbackRes.status === 403) {
                        const quotaExceededMessage = (rawData.language === 'en')
                            ? 'Your 2 free deep-analysis credits are used up. Redirecting to payment.'
                            : '您的 2 次免费深度分析额度已用完，正在跳转到支付页面。';
                        alert(quotaExceededMessage);
                        await redirectToPayment();
                        return;
                    }
                    if (!fallbackRes.ok) throw new Error('Webhook failed');
                } catch (e) {
                    console.warn('Fallback webhook error:', e);
                    alert((rawData.language === 'en') ? 'Submission failed. Please retry.' : '提交失败，请重试。');
                    return;
                }

                if (useLocalQuotaFallback && localUsageKey) {
                    localStorage.setItem(localUsageKey, String(localUsage + 1));
                }
                alert((rawData.language === 'en') ? 'Analysis started! Please check your email.' : '分析已开始！请查收您的邮箱。');
                window.location.href = (rawData.language === 'en') ? 'success_en.html?type=competitor' : 'success.html?type=competitor';
            }

        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    });

});
