async function testResource(url, timeout = 2500) {
    return new Promise((resolve) => {

        const script = document.createElement("script");
        let finished = false;

        function finish(blocked) {
            if (finished) return;
            finished = true;

            script.remove();
            resolve(blocked);
        }

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

        script.src = url;
        script.async = true;

        document.head.appendChild(script);

    });
        }
