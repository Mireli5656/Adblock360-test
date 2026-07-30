document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startTest");
    const resultCard = document.getElementById("resultCard");

    if (!startButton || !resultCard) return;

    async function loadJson(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Cannot load ${path}`);
        return await response.json();
    }

    function testResource(url, timeout = 2500) {
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

            script.src = url;
            script.async = true;

            script.onload = () => {
                clearTimeout(timer);
                done(false);
            };

            script.onerror = () => {
                clearTimeout(timer);
                done(true);
            };

            document.head.appendChild(script);
        });
    }

    async function runCategory(title, tests) {
        let html = `<h3>${title}</h3><ul class="test-list">`;
        const results = [];

        for (const test of tests) {
            html += `<li>⏳ ${test.name}</li>`;
            resultCard.innerHTML = html + `</ul>`;
            const blocked = await testResource(test.url);
            results.push({ name: test.name, blocked });
            html = `<h3>${title}</h3><ul class="test-list">`;
            for (const r of results) {
                html += `<li>${r.blocked ? "🟢" : "🔴"} ${r.name} - ${r.blocked ? "Blocked" : "Allowed"}</li>`;
            }
        }

        html += `</ul>`;
        resultCard.innerHTML = html;

        return results;
    }

    function calculate(resultsA, resultsB) {
        const all = [...resultsA, ...resultsB];
        const blocked = all.filter(r => r.blocked).length;
        const total = all.length;
        const score = total ? Math.round((blocked / total) * 100) : 100;
        return { blocked, total, score };
    }

    startButton.addEventListener("click", async () => {
        startButton.disabled = true;
        startButton.textContent = "Testing...";
        resultCard.innerHTML = "<h3>Running tests...</h3>";

        try {
            const ads = await loadJson("tests/ads.json");
            const trackers = await loadJson("tests/trackers.json");

            const adResults = await runCategory("Ads", ads);
            const trackerResults = await runCategory("Trackers", trackers);

            const summary = calculate(adResults, trackerResults);

            resultCard.innerHTML = `
                <h2>AdBlock360 Report</h2>
                <p><strong>Blocked:</strong> ${summary.blocked} / ${summary.total}</p>
                <p><strong>Score:</strong> ${summary.score} / 100</p>
                <hr>
                <p><strong>Ads:</strong> ${adResults.filter(r => r.blocked).length} / ${adResults.length}</p>
                <p><strong>Trackers:</strong> ${trackerResults.filter(r => r.blocked).length} / ${trackerResults.length}</p>
                <hr>
                <div class="result-grid">
                    <div>
                        <h3>Ads</h3>
                        ${adResults.map(r => `<p>${r.blocked ? "🟢" : "🔴"} ${r.name} - ${r.blocked ? "Blocked" : "Allowed"}</p>`).join("")}
                    </div>
                    <div>
                        <h3>Trackers</h3>
                        ${trackerResults.map(r => `<p>${r.blocked ? "🟢" : "🔴"} ${r.name} - ${r.blocked ? "Blocked" : "Allowed"}</p>`).join("")}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);
            resultCard.innerHTML = `
                <h2>❌ Error</h2>
                <p>${error.message}</p>
            `;
        }

        startButton.disabled = false;
        startButton.textContent = "Run Again";
    });
});
