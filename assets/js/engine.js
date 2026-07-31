const AdBlock360Engine = (() => {
    const DEFAULT_TIMEOUT = 3000;

    function addCacheBuster(url) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_ab360=${Date.now()}`;
    }

    async function testResource(url, timeout = DEFAULT_TIMEOUT) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            let finished = false;

            const finish = (blocked) => {
                if (finished) return;

                finished = true;
                script.remove();
                resolve(blocked);
            };

            const timer = setTimeout(() => {
                finish(true);
            }, timeout);

            script.onload = () => {
                clearTimeout(timer);
                finish(false);
            };

            script.onerror = () => {
                clearTimeout(timer);
                finish(true);
            };

            script.async = true;
            script.src = addCacheBuster(url);

            document.head.appendChild(script);
        });
    }

    async function runTests(list, onProgress = null) {
        const results = [];

        for (let i = 0; i < list.length; i++) {
            const item = list[i];

            const blocked = await testResource(item.url);

            const result = {
                ...item,
                blocked
            };

            results.push(result);

            if (typeof onProgress === "function") {
                onProgress(i + 1, list.length, result);
            }
        }

        return results;
    }

    return {
        testResource,
        runTests
    };
})();

window.AdBlock360Engine = AdBlock360Engine;
window.testResource = AdBlock360Engine.testResource;
