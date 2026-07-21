const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

function testScript(url) {
    return new Promise((resolve) => {
        const script = document.createElement("script");

        script.src = url;
        script.async = true;

        script.onload = () => {
            script.remove();
            resolve(false); // Bloklanmayıb
        };

        script.onerror = () => {
            script.remove();
            resolve(true); // Çox güman ki bloklanıb
        };

        document.head.appendChild(script);
    });
}

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    resultCard.innerHTML = "<h3>Running tests...</h3>";

    const results = [];

    for (const test of adTests) {

        resultCard.innerHTML = `<h3>Testing ${test.name}...</h3>`;

        const blocked = await testScript(test.url);

        results.push({
            name: test.name,
            blocked: blocked
        });
    }

    const blockedCount = results.filter(r => r.blocked).length;

    let html = `
        <h2>AdBlock Test Results</h2>
        <p><strong>${blockedCount} / ${results.length}</strong> tests blocked</p>
        <hr>
    `;

    results.forEach(r => {
        html += `
            <p>${r.blocked ? "✅" : "❌"} ${r.name}</p>
        `;
    });

    resultCard.innerHTML = html;

    startButton.disabled = false;
    startButton.textContent = "Run Again";

});
