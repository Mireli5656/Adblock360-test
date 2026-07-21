const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

async function loadTests(file) {
    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Cannot load ${file}`);
    }

    return await response.json();
}

async function runCategory(title, tests) {

    let blocked = 0;
    let html = `<h3>${title}</h3><ul>`;

    for (const test of tests) {

        html += `<li>⏳ ${test.name}</li>`;
    }

    html += "</ul>";

    resultCard.innerHTML = html;

    return {
        blocked,
        total: tests.length
    };
}

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    try {

        const ads = await loadTests("tests/ads.json");
        const trackers = await loadTests("tests/trackers.json");

        const adResult = await runCategory("Ads", ads);
        const trackerResult = await runCategory("Trackers", trackers);

        resultCard.innerHTML = `
            <h2>AdBlock360</h2>

            <p>Ads Tests: ${adResult.total}</p>

            <p>Tracker Tests: ${trackerResult.total}</p>

            <p>Engine loaded successfully ✅</p>
        `;

    } catch (err) {

        resultCard.innerHTML = `
            <h2>Error</h2>
            <p>${err.message}</p>
        `;

    }

    startButton.disabled = false;
    startButton.textContent = "Run Again";

});
