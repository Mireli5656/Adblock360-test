document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startTest");
    const resultCard = document.getElementById("resultCard");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const progressPercent = document.getElementById("progressPercent");

    if (!startButton || !resultCard || !progressContainer || !progressFill || !progressText || !progressPercent) {
        return;
    }

    async function loadJson(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Cannot load ${path}`);
        }
        return await response.json();
    }

    function updateProgress(done, total, label = "Running") {
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        progressContainer.style.display = "block";
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${label} ${done}/${total}`;
        progressPercent.textContent = `${percent}%`;
    }

    function renderCategory(title, results) {
        return `
            <div class="section">
                <h3>${title}</h3>
                <ul class="test-list">
                    ${results.map((r) => `<li>${r.blocked ? "🟢" : "🔴"} ${r.name} - ${r.blocked ? "Blocked" : "Allowed"}</li>`).join("")}
                </ul>
            </div>
        `;
    }

    function renderSummary(adResults, trackerResults) {
        const allResults = [...adResults, ...trackerResults];
        const blocked = allResults.filter((r) => r.blocked).length;
        const total = allResults.length;
        const score = total > 0 ? Math.round((blocked / total) * 100) : 100;

        return `
            <h2>AdBlock360 Report</h2>
            <p><strong>Blocked:</strong> ${blocked} / ${total}</p>
            <p><strong>Score:</strong> ${score} / 100</p>
            <hr>
            <p><strong>Ads:</strong> ${adResults.filter((r) => r.blocked).length} / ${adResults.length}</p>
            <p><strong>Trackers:</strong> ${trackerResults.filter((r) => r.blocked).length} / ${trackerResults.length}</p>
            <hr>
            <div class="result-grid">
                <div>${renderCategory("Ads", adResults)}</div>
                <div>${renderCategory("Trackers", trackerResults)}</div>
            </div>
        `;
    }

    async function testResource(url, timeout = 2500) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            let finished = false;

            const done = (blocked) => {
                if (finished) return;
                finished = true;
                script.remove();
                resolve(blocked);
            };

            const timer = setTimeout(() => done(true), timeout);

            script.onload = () => {
                clearTimeout(timer);
                done(false);
            };

            script.onerror = () => {
                clearTimeout(timer);
                done(true);
            };

            script.src = url;
            script.async = true;
            document.head.appendChild(script);
        });
    }

    async function runTests(tests, label, startIndex, totalCount, results) {
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            updateProgress(startIndex + i, totalCount, label);

            const blocked = await testResource(test.url);
            results.push({ name: test.name, blocked });

            resultCard.innerHTML = `
                <h2>AdBlock360 Report</h2>
                <p><strong>Status:</strong> ${label}</p>
                <p><strong>Progress:</strong> ${startIndex + i} / ${totalCount}</p>
                <hr>
                ${renderCategory("Ads", label === "Ads" ? results : [])}
                ${renderCategory("Trackers", label === "Trackers" ? results : [])}
            `;
        }
    }

    startButton.addEventListener("click", async () => {
        startButton.disabled = true;
        startButton.textContent = "Testing...";

        progressContainer.style.display = "block";
        progressFill.style.width = "0%";
        progressText.textContent = "Starting...";
        progressPercent.textContent = "0%";
        resultCard.innerHTML = "<p>Loading tests...</p>";

        try {
            const ads = await loadJson("tests/ads.json");
            const trackers = await loadJson("tests/trackers.json");

            const total = ads.length + trackers.length;
            let done = 0;

            const adResults = [];
            const trackerResults = [];

            await runTests(ads, "Ads", done, total, adResults);
            done += ads.length;
            updateProgress(done, total, "Ads complete");

            await runTests(trackers, "Trackers", done, total, trackerResults);
            done += trackers.length;
            updateProgress(done, total, "Completed");

            progressFill.style.width = "100%";
            progressPercent.textContent = "100%";
            progressText.textContent = "Completed";

            resultCard.innerHTML = renderSummary(adResults, trackerResults);
        } catch (error) {
            console.error(error);
            resultCard.innerHTML = `
                <h2>❌ Error</h2>
                <p>${error.message}</p>
            `;
            progressText.textContent = "Error";
        } finally {
            startButton.disabled = false;
            startButton.textContent = "Run Again";
        }
    });
});
