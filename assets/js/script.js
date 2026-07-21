const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

async function loadJson(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load: ${path}`);
    }

    return await response.json();
}

async function runTests(title, tests) {

    let html = `<h3>${title}</h3><ul>`;

    for (const test of tests) {
        html += `<li>⏳ ${test.name}</li>`;
    }

    html += "</ul>";

    resultCard.innerHTML = html;

    return tests.length;
}

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    try {

        const ads = await loadJson("tests/ads.json");
        const trackers = await loadJson("tests/trackers.json");

        const adCount = await runTests("Ads", ads);
        const trackerCount = await runTests("Trackers", trackers);

        resultCard.innerHTML = `
            <h2>✅ Engine Loaded</h2>

            <p>Ads Tests: <b>${adCount}</b></p>

            <p>Tracker Tests: <b>${trackerCount}</b></p>

            <p>Everything loaded successfully.</p>
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
