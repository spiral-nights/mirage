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
  refreshSpaces: () => Promise<void>;
  deleteApp: (naddr: string) => Promise<boolean>;
  deleteSpace: (spaceId: string) => Promise<boolean>;
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
    const init = async () => {
      // If initialization has already completed, just set the local state
      if (globalHost && !initPromise) {
        console.log('[useMirage] Using existing host instance');
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // If another init is in progress, wait for it to finish completely
      if (initPromise) {
        console.log('[useMirage] Waiting for existing init...');
        await initPromise;
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // Prevent double initialization within same render cycle (React Strict Mode)
      if (initRef.current) {
        console.log('[useMirage] Init already started, skipping');
        return;
      }
      initRef.current = true;

      // Create new init promise
      initPromise = (async () => {
        try {
          console.log('[useMirage] Creating new MirageHost instance');
          const origin = window.location.origin;
          // 1. Wait for window.nostr to appear (some extensions are async)
          const waitForNostr = async (limit: number) => {
            for (let i = 0; i < limit / 100; i++) {
              if ((window as any).nostr) return true;
              await new Promise(r => setTimeout(r, 100));
            }
            return !!(window as any).nostr;
          };

          await waitForNostr(2000);

          const signer = (window as any).nostr;
          const mirageHost = new MirageHost({
            relays: ['wss://relay.damus.io', 'wss://nos.lol'],
            engineUrl: `${origin}/engine-worker.js`,
            bridgeUrl: `${origin}/bridge.js`,
            signer
          });

          globalHost = mirageHost;
          setHost(mirageHost);

          // 2. Attempt to get pubkey with retries
          try {
            if (signer) {
              let pk = '';
              let attempts = 0;
              while (attempts < 3) {
                try {
                  console.log(`[useMirage] Requesting pubkey (attempt ${attempts + 1})...`);
                  pk = await Promise.race([
                    signer.getPublicKey(),
                    new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Signer timed out')), 10000))
                  ]);
                  if (pk) break;
                } catch (e) {
                  console.warn(`[useMirage] Pubkey attempt ${attempts + 1} failed:`, e);
                  attempts++;
                  if (attempts < 3) await new Promise(r => setTimeout(r, 500));
                }
              }

              if (pk) {
                console.log('[useMirage] Received pubkey:', pk.slice(0, 8) + '...');
                setPubkey(pk);
                mirageHost.setPubkey(pk);

                // Load initial data
                console.log('[useMirage] Loading initial data...');
                try {
                  const [library, spacesData] = await Promise.all([
                    mirageHost.request('GET', '/mirage/v1/library/apps'),
                    mirageHost.request('GET', '/mirage/v1/spaces/all')
                  ]);

                  if (Array.isArray(library)) setApps(library);
                  if (Array.isArray(spacesData)) setSpaces(spacesData);
                } catch (dataErr) {
                  console.warn('[useMirage] Initial data fetch failed:', dataErr);
                }
              } else {
                console.warn('[useMirage] Failed to get pubkey after 3 attempts');
              }
            }
          } catch (e) {
            console.warn('[useMirage] Signer access failed:', e);
          }
        } catch (e) {
          console.error('[useMirage] Host initialization failed:', e);
        } finally {
          setIsReady(true);
          initPromise = null;
        }
      })();

      await initPromise;
      setIsReady(true);
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

  // Refresh spaces from the engine
  const refreshSpaces = useCallback(async () => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot refresh spaces: host not ready');
      return;
    }

    try {
      console.log('[useMirage] Refreshing spaces from engine...');
      const spacesData = await currentHost.request('GET', '/mirage/v1/spaces/all');
      console.log('[useMirage] Loaded spaces:', spacesData);
      if (Array.isArray(spacesData)) {
        setSpaces(spacesData);
      }
    } catch (e) {
      console.error('[useMirage] Failed to refresh spaces:', e);
    }
  }, [host]);

  // Delete an app from the library
  const deleteApp = async (naddr: string): Promise<boolean> => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot delete app: host not ready');
      return false;
    }

    try {
      console.log('[useMirage] Deleting app:', naddr.slice(0, 20) + '...');
      const result = await currentHost.request('DELETE', '/mirage/v1/library/apps', { naddr });
      if (result.deleted) {
        console.log('[useMirage] App deleted successfully');
        setApps(prevApps => prevApps.filter(a => a.naddr !== naddr));
        return true;
      }
      return false;
    } catch (e) {
      console.error('[useMirage] Failed to delete app:', e);
      return false;
    }
  };

  // Delete a space
  const deleteSpace = async (spaceId: string): Promise<boolean> => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot delete space: host not ready');
      return false;
    }

    try {
      console.log('[useMirage] Deleting space:', spaceId);
      const result = await currentHost.request('DELETE', `/mirage/v1/spaces/${spaceId}`);
      if (result.deleted) {
        console.log('[useMirage] Space deleted successfully');
        setSpaces(prevSpaces => prevSpaces.filter(s => s.id !== spaceId));
        return true;
      }
      return false;
    } catch (e) {
      console.error('[useMirage] Failed to delete space:', e);
      return false;
    }
  };

  return (
    <MirageContext.Provider value={{ host, isReady, pubkey, apps, spaces, publishApp, fetchApp, refreshApps, refreshSpaces, deleteApp, deleteSpace }}>
      {!isReady ? (
        <div className="fixed inset-0 bg-[#0A0A0B] flex flex-col items-center justify-center p-12 z-[9999]">
          <div className="w-16 h-16 border-2 border-white/5 border-t-white rounded-full animate-spin mb-6" />
          <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-bold animate-pulse">
            Initializing Mirage Platform
          </div>
        </div>
      ) : (
        children
      )}
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