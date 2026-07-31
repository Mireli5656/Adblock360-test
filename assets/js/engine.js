async function testResource(test) {
    return new Promise((resolve) => {

        const img = new Image();

        let finished = false;

        function complete(blocked) {
            if (finished) return;

            finished = true;

            resolve({
                name: test.name,
                url: test.url,
                blocked
            });
        }

        img.onload = () => complete(false);

        img.onerror = () => complete(true);

        img.src = test.url + "?t=" + Date.now();

        setTimeout(() => complete(true), 3000);

    });
}

async function runTests(testList, onProgress = null) {

    const results = [];

    for (let i = 0; i < testList.length; i++) {

        const result = await testResource(testList[i]);

        results.push(result);

        if (onProgress) {
            onProgress(i + 1, testList.length, result);
        }
    }

    return results;
            }
