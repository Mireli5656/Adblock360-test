function testResource(url, timeout = 2500) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        let finished = false;

        const done = (blocked) => {
            if (finished) return;
            finished = true;
            script.remove();
            resolve(blocked);
        };

        const timer = setTimeout(() => done(true), timeout);

        script.onload = () => {
            clearTimeout(timer);
            done(false);
        };

        script.onerror = () => {
            clearTimeout(timer);
            done(true);
        };

        script.src = url;
        script.async = true;
        document.head.appendChild(script);
    });
        }
