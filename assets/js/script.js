document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startTest");
    const resultCard = document.getElementById("resultCard");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const progressPercent = document.getElementById("progressPercent");

    if (!startButton || !resultCard || !progressContainer || !progressFill || !progressText || !progressPercent) {
        console.error("AdBlock360: required elements missing.");
        return;
    }

    async function loadJson(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Cannot load ${path}`);
        return await response.json();
    }

    function setProgress(done, total, label) {
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        progressContainer.style.display = "block";
        progressFill.style.width = `${percent}%`;
        progressText.textContent = label;
        progressPercent.textContent = `${percent}%`;
    }

    function renderResults(title, results) {
        return `
            <div class="section">
                <h3>${title}</h3>
                <ul class="test-list">
                    ${results.map((r) => `<li>${r.blocked ? "🟢" : "🔴"} ${r.name} - ${r.blocked ? "Blocked" : "Allowed"}</li>`).join("")}
                </ul>
            </div>
        `;
    }

    function renderFinalReport(adResults, trackerResults) {
        const all = [...adResults, ...trackerResults];
        const blocked = all.filter((r) => r.blocked).length;
        const total = all.length;
        const score = total ? Math.round((blocked / total) * 100) : 100;

        return `
            <h2>AdBlock360 Report</h2>
            <p><strong>Blocked:</strong> ${blocked} / ${total}</p>
            <p><strong>Score:</strong> ${score} / 100</p>
            <hr>
            <p><strong>Ads:</strong> ${adResults.filter((r) => r.blocked).length} / ${adResults.length}</p>
            <p><strong>Trackers:</strong> ${trackerResults.filter((r) => r.blocked).length} / ${trackerResults.length}</p>
            <hr>
            <div class="result-grid">
                <div>${renderResults("Ads", adResults)}</div>
                <div>${renderResults("Trackers", trackerResults)}</div>
            </div>
        `;
    }

    async function runCategory(title, tests, doneStart, totalTests, results) {
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const done = doneStart + i;

            setProgress(done, totalTests, `Testing ${title}: ${test.name}`);
            const blocked = await testResource(test.url);

            results.push({
                name: test.name,
                blocked
            });

            resultCard.innerHTML = `
                <h2>AdBlock360 Report</h2>
                <p><strong>Status:</strong> ${title}</p>
                <p><strong>Current:</strong> ${test.name}</p>
                <hr>
                <div class="result-grid">
                    <div>${renderResults("Ads", title === "Ads" ? results : [])}</div>
                    <div>${renderResults("Trackers", title === "Trackers" ? results : [])}</div>
                </div>
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

            await runCategory("Ads", ads, done, total, adResults);
            done += ads.length;
            setProgress(done, total, "Ads complete");

            await runCategory("Trackers", trackers, done, total, trackerResults);
            done += trackers.length;
            setProgress(done, total, "Completed");

            progressFill.style.width = "100%";
            progressText.textContent = "Completed";
            progressPercent.textContent = "100%";

            resultCard.innerHTML = renderFinalReport(adResults, trackerResults);
        } catch (error) {
            console.error(error);
            progressText.textContent = "Error";
            resultCard.innerHTML = `
                <h2>❌ Error</h2>
                <p>${error.message}</p>
            `;
        } finally {
            startButton.disabled = false;
            startButton.textContent = "Run Again";
        }
    });
});
