document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startTest");
    const resultCard = document.getElementById("resultCard");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const progressPercent = document.getElementById("progressPercent");
    const resultsSection = document.getElementById("results");

    if (
        !startButton ||
        !resultCard ||
        !progressContainer ||
        !progressFill ||
        !progressText ||
        !progressPercent
    ) {
        console.error("AdBlock360: required elements missing.");
        return;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function extractDomain(url) {
        try {
            return new URL(url, window.location.href).hostname.replace(/^www\./, "");
        } catch {
            return url;
        }
    }

    async function loadJson(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Cannot load ${path}`);
        }
        return await response.json();
    }

    function setProgress(done, total, label) {
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        progressContainer.style.display = "block";
        progressFill.style.width = `${percent}%`;
        progressText.textContent = label;
        progressPercent.textContent = `${percent}%`;
    }

    function testResource(url, timeoutMs = 3000) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            const cacheBustedUrl = `${url}${url.includes("?") ? "&" : "?"}__ab360=${Date.now()}`;
            let finished = false;

            const finish = (blocked) => {
                if (finished) return;
                finished = true;
                script.remove();
                resolve(blocked);
            };

            const timer = window.setTimeout(() => {
                finish(true);
            }, timeoutMs);

            script.async = true;
            script.src = cacheBustedUrl;

            script.onload = () => {
                clearTimeout(timer);
                finish(false);
            };

            script.onerror = () => {
                clearTimeout(timer);
                finish(true);
            };

            document.head.appendChild(script);
        });
    }

    window.testResource = testResource;

    async function copyText(value, button) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = value;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                textarea.remove();
            }

            const originalText = button.textContent;
            button.textContent = "Copied ✓";
            window.setTimeout(() => {
                button.textContent = originalText;
            }, 1400);
        } catch {
            button.textContent = "Failed";
            window.setTimeout(() => {
                button.textContent = "Copy";
            }, 1400);
        }
    }

    function renderResultItem(result) {
        const domain = extractDomain(result.url);
        const statusLabel = result.blocked ? "Blocked" : "Allowed";
        const statusIcon = result.blocked ? "🟢" : "🔴";
        const statusClass = result.blocked ? "blocked" : "allowed";

        return `
            <details class="result-item">
                <summary class="result-summary">
                    <span class="result-name">${statusIcon} ${escapeHtml(result.name)}</span>
                    <span class="result-status ${statusClass}">${statusLabel}</span>
                </summary>

                <div class="result-details">
                    <p><strong>Category:</strong> ${escapeHtml(result.category)}</p>
                    <p><strong>Domain:</strong> ${escapeHtml(domain)}</p>
                    <p><strong>URL:</strong> ${escapeHtml(result.url)}</p>

                    <div class="result-actions">
                        <button type="button" class="copy-btn" data-copy-value="${escapeHtml(domain)}">Copy Domain</button>
                        <button type="button" class="copy-btn" data-copy-value="${escapeHtml(result.url)}">Copy URL</button>
                    </div>
                </div>
            </details>
        `;
    }

    function renderResults(title, results) {
        return `
            <div class="section">
                <h3>${escapeHtml(title)}</h3>
                <div class="test-list">
                    ${results.length ? results.map(renderResultItem).join("") : "<p>Waiting...</p>"}
                </div>
            </div>
        `;
    }

    function renderRunningReport(adResults, trackerResults, activeLabel) {
        return `
            <h2>AdBlock360 Report</h2>
            <p><strong>Status:</strong> ${escapeHtml(activeLabel)}</p>
            <p><strong>Ads tested:</strong> ${adResults.length}</p>
            <p><strong>Trackers tested:</strong> ${trackerResults.length}</p>
            <hr>
            <div class="result-grid">
                <div>${renderResults("Ads", adResults)}</div>
                <div>${renderResults("Trackers", trackerResults)}</div>
            </div>
        `;
    }

    function renderFinalReport(adResults, trackerResults, elapsedMs) {
        const all = [...adResults, ...trackerResults];
        const blocked = all.filter((r) => r.blocked).length;
        const total = all.length;
        const score = total ? Math.round((blocked / total) * 100) : 100;

        const adsBlocked = adResults.filter((r) => r.blocked).length;
        const trackersBlocked = trackerResults.filter((r) => r.blocked).length;

        const adScore = adResults.length ? Math.round((adsBlocked / adResults.length) * 100) : 100;
        const trackerScore = trackerResults.length ? Math.round((trackersBlocked / trackerResults.length) * 100) : 100;
        const seconds = (elapsedMs / 1000).toFixed(2);

        return `
            <h2>AdBlock360 Report</h2>

            <div class="report-stats">
                <p><strong>Blocked:</strong> ${blocked} / ${total}</p>
                <p><strong>Score:</strong> ${score} / 100</p>
                <p><strong>Ads:</strong> ${adsBlocked} / ${adResults.length}</p>
                <p><strong>Trackers:</strong> ${trackersBlocked} / ${trackerResults.length}</p>
                <p><strong>Completed in:</strong> ${seconds}s</p>
            </div>

            <hr>

            <div class="report-stats">
                <p><strong>Protection Analysis</strong></p>
                <p>Ads: ${adScore}%</p>
                <p>Trackers: ${trackerScore}%</p>
                <p>Overall: ${score}%</p>
            </div>

            <hr>

            <div class="result-grid">
                <div>${renderResults("Ads", adResults)}</div>
                <div>${renderResults("Trackers", trackerResults)}</div>
            </div>
        `;
    }

    async function runCategory(title, tests, targetResults, state, totalTests) {
        for (const test of tests) {
            setProgress(state.done + 1, totalTests, `Testing ${state.done + 1}/${totalTests}: ${test.name}`);

            const blocked = await testResource(test.url);

            targetResults.push({
                name: test.name,
                url: test.url,
                category: title,
                blocked
            });

            state.done += 1;
            resultCard.innerHTML = renderRunningReport(
                state.adResults,
                state.trackerResults,
                `Running ${title}: ${test.name}`
            );
        }
    }

    resultCard.addEventListener("click", (event) => {
        const button = event.target.closest(".copy-btn");
        if (!button) return;

        const value = button.dataset.copyValue || "";
        if (!value) return;

        copyText(value, button);
    });

    startButton.addEventListener("click", async () => {
        startButton.disabled = true;
        startButton.textContent = "Testing...";

        progressContainer.style.display = "block";
        progressFill.style.width = "0%";
        progressText.textContent = "Starting...";
        progressPercent.textContent = "0%";
        resultCard.innerHTML = "<p>Loading tests...</p>";

        const startedAt = performance.now();

        try {
            const ads = await loadJson("tests/ads.json");
            const trackers = await loadJson("tests/trackers.json");

            const state = {
                adResults: [],
                trackerResults: [],
                done: 0
            };

            const total = ads.length + trackers.length;

            await runCategory("Ads", ads, state.adResults, state, total);
            await runCategory("Trackers", trackers, state.trackerResults, state, total);

            const elapsedMs = performance.now() - startedAt;

            progressFill.style.width = "100%";
            progressText.textContent = "Completed";
            progressPercent.textContent = "100%";

            resultCard.innerHTML = renderFinalReport(state.adResults, state.trackerResults, elapsedMs);

            resultsSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (error) {
            console.error(error);
            progressText.textContent = "Error";
            resultCard.innerHTML = `
                <h2>❌ Error</h2>
                <p>${escapeHtml(error.message)}</p>
            `;
        } finally {
            startButton.disabled = false;
            startButton.textContent = "Run Again";
        }
    });
});
