import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { MirageHost } from '@mirage/host';
import { type AppDefinition } from '@mirage/core';
import { nip19 } from 'nostr-tools';

interface MirageContextType {
  host: MirageHost | null;
  isReady: boolean;
  pubkey: string | null;
  apps: AppDefinition[];
  spaces: any[];
  publishApp: (html: string, name?: string) => Promise<string>;
  fetchApp: (naddr: string) => Promise<string | null>;
}

const MirageContext = createContext<MirageContextType | undefined>(undefined);

export const MirageProvider = ({ children }: { children: ReactNode }) => {
  const [host, setHost] = useState<MirageHost | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [apps, setApps] = useState<AppDefinition[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const origin = window.location.origin;
      const mirageHost = new MirageHost({
        relays: ['wss://relay.damus.io', 'wss://nos.lol'],
        engineUrl: `${origin}/engine-worker.js`,
        bridgeUrl: `${origin}/bridge.js`,
        signer: (window as any).nostr
      });

      setHost(mirageHost);
      
      // Attempt to get pubkey
      try {
        if ((window as any).nostr) {
            const pk = await (window as any).nostr.getPublicKey();
            setPubkey(pk);
            
            // Load apps and spaces from Engine (Nostr)
            const [library, spacesData] = await Promise.all([
              mirageHost.request('GET', '/mirage/v1/library/apps'),
              mirageHost.request('GET', '/mirage/v1/spaces')
            ]);

            if (Array.isArray(library)) setApps(library);
            if (Array.isArray(spacesData)) setSpaces(spacesData);
        }
      } catch (e) {
        console.warn('Could not fetch pubkey or data:', e);
      }

      setIsReady(true);
    };

    init();
  }, []);

  const fetchApp = async (naddr: string): Promise<string | null> => {
    if (!host) return null;
    console.log('Fetching app:', naddr);
    try {
      return await host.fetchApp(naddr);
    } catch (err) {
      console.error('[useMirage] Failed to fetch app:', err);
      return null;
    }
  };

  const publishApp = async (html: string, name: string = 'Untitled App'): Promise<string> => {
    if (!host || !pubkey) throw new Error('Mirage not initialized or no signer found');

    const dTag = `mirage:app:${crypto.randomUUID()}`;
    
    // 1. Publish to Nostr via Engine API
    const result = await host.request('POST', '/mirage/v1/events', {
      kind: 30078,
      content: html,
      tags: [
        ['d', dTag],
        ['name', name],
        ['t', 'mirage_app']
      ]
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // 2. Generate naddr
    const naddr = nip19.naddrEncode({
      kind: 30078,
      pubkey: pubkey,
      identifier: dTag,
      relays: host.getRelays()
    });
    
    const newApp: AppDefinition = { naddr, name, createdAt: Date.now() };
    
    // 3. Save to Library
    await host.request('POST', '/mirage/v1/library/apps', newApp);
    
    setApps([newApp, ...apps]);

    return naddr; 
  };

  return (
    <MirageContext.Provider value={{ host, isReady, pubkey, apps, spaces, publishApp, fetchApp }}>
      {children}
    </MirageContext.Provider>
  );
};

export const useMirage = () => {
  const context = useContext(MirageContext);
  if (context === undefined) {
    throw new Error('useMirage must be used within a MirageProvider');
  }
  return context;
};