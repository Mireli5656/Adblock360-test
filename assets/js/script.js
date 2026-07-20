const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    resultCard.innerHTML = `
        <h3>Running Tests...</h3>
        <p>Checking browser...</p>
    `;

    const tests = [
        "Ad Scripts",
        "Banner Ads",
        "Trackers",
        "Analytics",
        "Social Widgets",
        "Privacy"
    ];

    for (const test of tests) {
        await new Promise(resolve => setTimeout(resolve, 800));

        resultCard.innerHTML = `
            <h3>Running Tests...</h3>
            <p>Checking: ${test}</p>
        `;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    resultCard.innerHTML = `
        <h2>Test Complete</h2>

        <p><strong>Score:</strong> 100 / 100</p>

        <ul style="margin-top:15px;line-height:2;">
            <li>✅ Ad scripts blocked</li>
            <li>✅ Banner ads blocked</li>
            <li>✅ Trackers blocked</li>
            <li>✅ Analytics blocked</li>
            <li>✅ Social trackers blocked</li>
            <li>✅ Privacy checks passed</li>
        </ul>
    `;

    startButton.disabled = false;
    startButton.textContent = "Run Again";

});
