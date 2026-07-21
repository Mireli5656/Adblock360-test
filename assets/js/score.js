function calculateScore(adResults, trackerResults) {

    const adBlocked = adResults.filter(r => r.blocked).length;
    const trackerBlocked = trackerResults.filter(r => r.blocked).length;

    const adPercent = adResults.length
        ? (adBlocked / adResults.length) * 100
        : 100;

    const trackerPercent = trackerResults.length
        ? (trackerBlocked / trackerResults.length) * 100
        : 100;

    const overall = Math.round((adPercent + trackerPercent) / 2);

    return {
        adBlocked,
        adTotal: adResults.length,
        trackerBlocked,
        trackerTotal: trackerResults.length,
        overall
    };
}
