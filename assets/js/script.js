const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

async function loadTests() {
    const response = await fetch("tests/ads.json");

    if (!response.ok) {
        throw new Error("ads.json tapılmadı");
    }

    return await response.json();
}

async function testUrl(test) {
    return new Promise((resolve) => {

        const script = document.createElement("script");

        script.src = test.url;
        script.async = true;

        script.onload = () => {
            script.remove();
            resolve({
                name: test.name,
                blocked: false
            });
        };

        script.onerror = () => {
            script.remove();
            resolve({
                name: test.name,
                blocked: true
            });
        };

        document.body.appendChild(script);

    });
}

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    resultCard.innerHTML = "<h3>Running tests...</h3>";

    try {

        const tests = await loadTests();

        let blocked = 0;

        let html = "<h2>Results</h2><ul>";

        for (const test of tests) {

            const result = await testUrl(test);

            if (result.blocked) {
                blocked++;
                html += `<li>🟢 ${result.name} - Blocked</li>`;
            } else {
                html += `<li>🔴 ${result.name} - Allowed</li>`;
            }

            resultCard.innerHTML = html + "</ul>";
        }

        html += `
        </ul>

        <hr>

        <h3>Blocked ${blocked} / ${tests.length}</h3>
        `;

        resultCard.innerHTML = html;

    } catch (err) {

        resultCard.innerHTML = `
            <h2>Error</h2>
            <p>${err.message}</p>
        `;

    }

    startButton.disabled = false;
    startButton.textContent = "Run Again";

});
