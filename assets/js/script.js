const startButton = document.getElementById("startTest");
const resultCard = document.getElementById("resultCard");

async function detectAdBlock() {

    return new Promise((resolve) => {

        const ad = document.createElement("div");

        ad.className = "adsbox";
        ad.style.position = "absolute";
        ad.style.left = "-999px";
        ad.innerHTML = "&nbsp;";

        document.body.appendChild(ad);

        setTimeout(() => {

            const blocked =
                ad.offsetHeight === 0 ||
                ad.clientHeight === 0 ||
                window.getComputedStyle(ad).display === "none";

            document.body.removeChild(ad);

            resolve(blocked);

        }, 120);

    });

}

startButton.addEventListener("click", async () => {

    startButton.disabled = true;
    startButton.textContent = "Testing...";

    resultCard.innerHTML = "<h3>Running AdBlock Test...</h3>";

    const blocked = await detectAdBlock();

    if (blocked) {

        resultCard.innerHTML = `
            <h2>✅ AdBlock Detected</h2>
            <p>Your ad blocker appears to be working.</p>
        `;

    } else {

        resultCard.innerHTML = `
            <h2>❌ No AdBlock Detected</h2>
            <p>Ads were not blocked.</p>
        `;

    }

    startButton.textContent = "Run Again";
    startButton.disabled = false;

});
