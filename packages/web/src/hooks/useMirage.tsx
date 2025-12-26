import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MirageHost } from '@mirage/host';
import type { UnsignedNostrEvent } from '@mirage/core';

interface MirageContextType {
  host: MirageHost | null;
  isReady: boolean;
  pubkey: string | null;
  publishApp: (html: string, name?: string) => Promise<string>;
  fetchApp: (naddr: string) => Promise<string | null>;
}

const MirageContext = createContext<MirageContextType | undefined>(undefined);

export const MirageProvider = ({ children }: { children: ReactNode }) => {
  const [host, setHost] = useState<MirageHost | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

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
        }
      } catch (e) {
        console.warn('Could not fetch pubkey:', e);
      }

      setIsReady(true);
    };

    init();

    return () => {
      // cleanup if needed
    };
  }, []);

  const fetchApp = async (naddr: string): Promise<string | null> => {
    if (!host) return null;
    console.log('Fetching app:', naddr);
    // TODO: Implement real fetch via Engine (Kind 30078 lookup)
    // For now, return a dummy app
    await new Promise(r => setTimeout(r, 1000));
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body { font-family: sans-serif; padding: 20px; text-align: center; }</style>
      </head>
      <body>
        <h1>Hello from Mirage!</h1>
        <p>This is a sandboxed app loaded from: ${naddr}</p>
        <button onclick="alert('It works!')">Click Me</button>
      </body>
      </html>
    `;
  };

  const publishApp = async (html: string, name: string = 'Untitled App'): Promise<string> => {
    if (!host || !pubkey) throw new Error('Mirage not initialized or no signer found');

    // Create Kind 30078 App Event
    const dTag = `mirage:app:${crypto.randomUUID()}`;
    const event: UnsignedNostrEvent = {
      kind: 30078,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', dTag],
        ['name', name],
        ['t', 'mirage_app']
      ],
      content: html,
      pubkey: pubkey
    };

    // Sign using NIP-07
    const signedEvent = await (window as any).nostr.signEvent(event);
    
    // Broadcast via Host's pool (this is a bit of a hack until Host has a direct pool access)
    // For now, we'll manually send to the engine worker to publish
    (host as any).engineWorker.postMessage({
        type: 'API_REQUEST',
        id: crypto.randomUUID(),
        method: 'POST',
        path: '/storage/internal_publish', // This doesn't exist yet, but we'll use a raw message
        body: signedEvent
    });

    // Return the naddr (simplified mock for now)
    return `naddr1...`; 
  };

  return (
    <MirageContext.Provider value={{ host, isReady, pubkey, publishApp, fetchApp }}>
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
