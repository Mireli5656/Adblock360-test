const AdBlock360Engine = (() => {
    const DEFAULT_TIMEOUT_MS = 3000;

    function addCacheBuster(url) {
        try {
            const parsed = new URL(url, window.location.href);
            parsed.searchParams.set("__ab360", String(Date.now()));
            return parsed.toString();
        } catch {
            const joiner = url.includes("?") ? "&" : "?";
            return `${url}${joiner}__ab360=${Date.now()}`;
        }
    }

    function makeResult(test, blocked, status = blocked ? "blocked" : "allowed") {
        return {
            name: test.name,
            url: test.url,
            kind: test.kind || "script",
            blocked,
            status
        };
    }

    function probeWithScript(test, timeoutMs) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            const url = addCacheBuster(test.url);
            let finished = false;

            const finish = (blocked, status) => {
                if (finished) return;
                finished = true;
                script.remove();
                resolve(makeResult(test, blocked, status));
            };

            const timer = window.setTimeout(() => {
                finish(true, "timeout");
            }, timeoutMs);

            script.async = true;
            script.src = url;

            script.onload = () => {
                clearTimeout(timer);
                finish(false, "allowed");
            };

            script.onerror = () => {
                clearTimeout(timer);
                finish(true, "blocked");
            };

            document.head.appendChild(script);
        });
    }

    function probeWithImage(test, timeoutMs) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = addCacheBuster(test.url);
            let finished = false;

            const finish = (blocked, status) => {
                if (finished) return;
                finished = true;
                resolve(makeResult(test, blocked, status));
            };

            const timer = window.setTimeout(() => {
                finish(true, "timeout");
            }, timeoutMs);

            img.onload = () => {
                clearTimeout(timer);
                finish(false, "allowed");
            };

            img.onerror = () => {
                clearTimeout(timer);
                finish(true, "blocked");
            };

            img.src = url;
        });
    }

    function probeWithFetch(test, timeoutMs) {
        return new Promise((resolve) => {
            const controller = new AbortController();
            const url = addCacheBuster(test.url);
            let finished = false;

            const finish = (blocked, status) => {
                if (finished) return;
                finished = true;
                resolve(makeResult(test, blocked, status));
            };

            const timer = window.setTimeout(() => {
                controller.abort();
                finish(true, "timeout");
            }, timeoutMs);

            fetch(url, {
                method: "GET",
                mode: "no-cors",
                cache: "no-store",
                credentials: "omit",
                redirect: "follow",
                signal: controller.signal
            })
                .then(() => {
                    clearTimeout(timer);
                    finish(false, "allowed");
                })
                .catch(() => {
                    clearTimeout(timer);
                    finish(true, "blocked");
                });
        });
    }

    function probe(test, timeoutMs = DEFAULT_TIMEOUT_MS) {
        const kind = (test.kind || "script").toLowerCase();

        if (kind === "img" || kind === "image" || kind === "pixel") {
            return probeWithImage(test, timeoutMs);
        }

        if (kind === "fetch") {
            return probeWithFetch(test, timeoutMs);
        }

        return probeWithScript(test, timeoutMs);
    }

    async function runTests(testList, onProgress = null, timeoutMs = DEFAULT_TIMEOUT_MS) {
        const results = [];

        for (let i = 0; i < testList.length; i++) {
            const result = await probe(testList[i], timeoutMs);
            results.push(result);

            if (typeof onProgress === "function") {
                onProgress(i + 1, testList.length, result, results);
            }
        }

        return results;
    }

    return {
        probe,
        runTests
    };
})();

window.AdBlock360Engine = AdBlock360Engine;
