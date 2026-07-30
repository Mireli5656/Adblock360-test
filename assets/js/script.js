document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById("startTest");
    const resultCard = document.getElementById("resultCard");

    startButton.addEventListener("click", async () => {

        startButton.disabled = true;
        startButton.textContent = "Testing...";

        resultCard.innerHTML = "<h2>Loading...</h2>";

        try {

            const response = await fetch("tests/ads.json");

            if (!response.ok) {
                throw new Error("ads.json tapılmadı.");
            }

            const tests = await response.json();

            let html = `
                <h2>AdBlock360</h2>
                <p>Total Tests: <b>${tests.length}</b></p>
                <hr>
            `;

            tests.forEach((test, index) => {
                html += `<p>${index + 1}. ${test.name}</p>`;
            });

            resultCard.innerHTML = html;

        } catch (error) {

            resultCard.innerHTML = `
                <h2>❌ Error</h2>
                <p>${error.message}</p>
            `;

            console.error(error);

        }

        startButton.disabled = false;
        startButton.textContent = "Run Again";

    });

});
