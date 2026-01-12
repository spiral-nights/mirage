import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { useMirage } from '../../hooks/useMirage';
import { getAppCanonicalId } from '../../lib/utils';

export const ResolvedAppName = ({ naddr, className }: { naddr: string; className?: string }) => {
    const { host, apps } = useMirage();
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const resolve = async () => {
            // 1. Check verified apps first
            const existing = apps.find(a => getAppCanonicalId(a.naddr) === getAppCanonicalId(naddr));
            if (existing) {
                if (mounted) setName(existing.name);
                return;
            }

            // 2. Fetch from network
            try {
                if (host && naddr && naddr !== 'unknown' && naddr.length > 7) {
                    console.log(`[AppName] Fetching for ${naddr}...`);

                    let fetchNaddr = naddr;
                    // Convert colon-separated coordinate to naddr if needed
                    if (naddr.includes(':')) {
                        try {
                            const parts = naddr.split(':');
                            if (parts.length >= 3) {
                                const kind = parseInt(parts[0]);
                                const pubkey = parts[1];
                                const identifier = parts.slice(2).join(':');
                                fetchNaddr = nip19.naddrEncode({ kind, pubkey, identifier });
                                console.log(`[AppName] Converted ${naddr} to ${fetchNaddr}`);
                            }
                        } catch (err) {
                            console.warn("[AppName] Failed to convert coordinate to naddr", err);
                        }
                    }

                    const code = await host.fetchApp(fetchNaddr);
                    if (code && mounted) {
                        const match = code.match(/<title>(.*?)<\/title>/i);
                        if (match && match[1]) {
                            setName(match[1].trim());
                        } else {
                            console.warn(`[AppName] No title tag found in code.`);
                        }
                    }
                }
            } catch (e) {
                console.error(`[AppName] Fetch error:`, e);
                // ignore
            }
        };
        resolve();
        return () => { mounted = false; };
    }, [naddr, host, apps]);

    if (name) return <span className={className}>{name}</span>;
    return <span className={className}>App: {naddr.slice(0, 12)}...{naddr.slice(-4)}</span>;
};
