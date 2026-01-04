/* NUCLEAR WIPER */
(async () => {
    const signer = window.nostr;
    if (!signer) { console.error("❌ No NIP-07 extension found!"); return; }

    const pubkey = await signer.getPublicKey();
    console.log(`🔑 Nuking data for: ${pubkey}`);

    // const relays = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
    const relays = ["wss://relay.damus.io"]; // Use this if you only want to hit one

    // 1. Scan
    console.log(`📡 Scanning...`);
    const events = [];
    const subId = "wipe-" + Math.random().toString(36).slice(2);

    await Promise.all(relays.map(url => new Promise(r => {
        try {
            const ws = new WebSocket(url);
            ws.onopen = () => ws.send(JSON.stringify(["REQ", subId, { kinds: [30078], authors: [pubkey], limit: 100 }]));
            ws.onmessage = (msg) => {
                const d = JSON.parse(msg.data);
                if (d[0] === "EVENT") events.push(d[2]);
                if (d[0] === "EOSE") { ws.close(); r(); }
            };
            ws.onerror = () => r(); setTimeout(() => r(), 3000);
        } catch (e) { r(); }
    })));

    // 2. Identify
    const itemsToDelete = [];
    events.forEach(e => {
        const d = e.tags.find(t => t[0] === 'd')?.[1];
        if (d && (d.startsWith('mirage:') || d.includes(':mirage:'))) itemsToDelete.push(d);
    });
    const uniqueItems = [...new Set(itemsToDelete)];

    console.log(`🗑 Found ${uniqueItems.length} items to nuke.`);
    if (uniqueItems.length === 0) { console.log("✅ Clean."); return; }

    // 3. EXECUTE
    for (const [i, dTag] of uniqueItems.entries()) {
        console.log(`[${i + 1}/${uniqueItems.length}] Nuking ${dTag}...`);
        try {
            // A. Overwrite (Instant)
            const tombstone = {
                kind: 30078, created_at: Math.floor(Date.now() / 1000) + 1,
                tags: [['d', dTag], ['deleted', 'true']], content: '{}', pubkey
            };
            const signedTombstone = await signer.signEvent(tombstone);

            // B. Delete (Cleanup)
            const deletion = {
                kind: 5, created_at: Math.floor(Date.now() / 1000) + 5,
                tags: [['a', `30078:${pubkey}:${dTag}`]], content: 'Nuclear delete', pubkey
            };
            const signedDeletion = await signer.signEvent(deletion);

            for (const url of relays) {
                await new Promise(resolve => {
                    const ws = new WebSocket(url);
                    ws.onopen = () => {
                        ws.send(JSON.stringify(["EVENT", signedTombstone]));
                        ws.send(JSON.stringify(["EVENT", signedDeletion]));
                    };
                    ws.onmessage = (msg) => {
                        const d = JSON.parse(msg.data);
                        if (d[0] === "OK") console.log(`   ${d[2] ? "✅" : "❌"} ${url}: ${d[3]}`);
                    };
                    setTimeout(() => { ws.close(); resolve() }, 1500);
                });
            }
        } catch (e) { console.error(e); }
    }
    console.log("✅ DONE. Reload page.");
})();