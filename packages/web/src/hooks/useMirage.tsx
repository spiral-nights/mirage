import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
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
  refreshApps: () => Promise<void>;
}

const MirageContext = createContext<MirageContextType | undefined>(undefined);

// Singleton to prevent double initialization in React Strict Mode
let globalHost: MirageHost | null = null;
let initPromise: Promise<void> | null = null;

export const MirageProvider = ({ children }: { children: ReactNode }) => {
  const [host, setHost] = useState<MirageHost | null>(globalHost);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [apps, setApps] = useState<AppDefinition[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const initRef = useRef(false);

  // Refresh apps from the engine
  const refreshApps = useCallback(async () => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot refresh apps: host not ready');
      return;
    }

    try {
      console.log('[useMirage] Refreshing apps from engine...');
      const library = await currentHost.request('GET', '/mirage/v1/library/apps');
      console.log('[useMirage] Loaded apps:', library);
      if (Array.isArray(library)) {
        setApps(library);
      }
    } catch (e) {
      console.error('[useMirage] Failed to refresh apps:', e);
    }
  }, [host]);

  useEffect(() => {
    // Prevent double initialization (React Strict Mode)
    if (initRef.current) {
      console.log('[useMirage] Already initialized, skipping');
      return;
    }
    initRef.current = true;

    const init = async () => {
      // Use existing host if available (singleton pattern)
      if (globalHost) {
        console.log('[useMirage] Using existing host instance');
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // If another init is in progress, wait for it
      if (initPromise) {
        console.log('[useMirage] Waiting for existing init...');
        await initPromise;
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // Create new init promise
      initPromise = (async () => {
        console.log('[useMirage] Creating new MirageHost instance');
        const origin = window.location.origin;
        const mirageHost = new MirageHost({
          relays: ['wss://relay.damus.io', 'wss://nos.lol'],
          engineUrl: `${origin}/engine-worker.js`,
          bridgeUrl: `${origin}/bridge.js`,
          signer: (window as any).nostr
        });

        globalHost = mirageHost;
        setHost(mirageHost);

        // Attempt to get pubkey
        try {
          if ((window as any).nostr) {
            const pk = await (window as any).nostr.getPublicKey();
            setPubkey(pk);

            // Inform the Engine about the pubkey for authenticated API requests
            mirageHost.setPubkey(pk);

            // Load apps and spaces from Engine (Nostr)
            console.log('[useMirage] Loading initial data...');
            const [library, spacesData] = await Promise.all([
              mirageHost.request('GET', '/mirage/v1/library/apps'),
              mirageHost.request('GET', '/mirage/v1/spaces')
            ]);

            console.log('[useMirage] Loaded apps:', library);
            console.log('[useMirage] Loaded spaces:', spacesData);

            if (Array.isArray(library)) setApps(library);
            if (Array.isArray(spacesData)) setSpaces(spacesData);
          }
        } catch (e) {
          console.warn('Could not fetch pubkey or data:', e);
        }

        setIsReady(true);
      })();

      await initPromise;
    };

    init();
  }, []);

  const fetchApp = async (naddr: string): Promise<string | null> => {
    const currentHost = host || globalHost;
    if (!currentHost) return null;
    console.log('[useMirage] Fetching app:', naddr);
    try {
      return await currentHost.fetchApp(naddr);
    } catch (err) {
      console.error('[useMirage] Failed to fetch app:', err);
      return null;
    }
  };

  const publishApp = async (html: string, name: string = 'Untitled App'): Promise<string> => {
    const currentHost = host || globalHost;
    if (!currentHost || !pubkey) throw new Error('Mirage not initialized or no signer found');

    const dTag = `mirage:app:${crypto.randomUUID()}`;

    console.log('[useMirage] Publishing app:', { name, dTag });

    // 1. Publish to Nostr via Engine API
    const result = await currentHost.request('POST', '/mirage/v1/events', {
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

    console.log('[useMirage] App published, generating naddr...');

    // 2. Generate naddr
    const naddr = nip19.naddrEncode({
      kind: 30078,
      pubkey: pubkey,
      identifier: dTag,
      relays: currentHost.getRelays()
    });

    const newApp: AppDefinition = { naddr, name, createdAt: Date.now() };

    console.log('[useMirage] Saving to library:', newApp);

    // 3. Save to Library
    await currentHost.request('POST', '/mirage/v1/library/apps', newApp);

    console.log('[useMirage] App saved to library successfully');

    // Update local state immediately
    setApps(prevApps => [newApp, ...prevApps]);

    return naddr;
  };

  return (
    <MirageContext.Provider value={{ host, isReady, pubkey, apps, spaces, publishApp, fetchApp, refreshApps }}>
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