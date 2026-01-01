import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { MirageHost } from '@mirage/host';
import { type AppDefinition } from '@mirage/core';
import { nip19 } from 'nostr-tools';
import { INITIAL_ENABLED_RELAYS } from '../lib/relays';

interface MirageContextType {
  host: MirageHost | null;
  isReady: boolean;
  pubkey: string | null;
  apps: AppDefinition[];
  notification: string | null;
  publishApp: (html: string, name?: string, existingDTag?: string) => Promise<string>;
  fetchApp: (naddr: string) => Promise<string | null>;
  refreshApps: () => Promise<void>;
  deleteApp: (naddr: string) => Promise<boolean>;
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
  const [notification, setNotification] = useState<string | null>(null);
  const initRef = useRef(false);

  // Refresh apps from the engine
  const refreshApps = useCallback(async () => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot refresh apps: host not ready');
      return;
    }

    try {
      const library = await currentHost.request('GET', '/mirage/v1/library/apps');
      if (Array.isArray(library)) {
        setApps(library);
      }
    } catch (e) {
      console.error('[useMirage] Failed to refresh apps:', e);
    }
  }, [host]);

  // Listen for Engine events
  useEffect(() => {
    if (!host) return;

    const handleNewSpace = (msg: any) => {
        setNotification(`New space added: ${msg.spaceName || 'Unnamed Space'}`);
        // Refresh apps/spaces? The apps list might not change if it's just a space for an existing app?
        // But if it's a new app entirely? NIP-17 logic currently adds key.
        // It doesn't fetch the app code automatically unless we build that.
        // For now, refreshing apps/spaces is good.
        refreshApps();
        
        setTimeout(() => setNotification(null), 3000);
    };

    host.on('new_space_invite', handleNewSpace);

    return () => {
        host.off('new_space_invite', handleNewSpace);
    };
  }, [host, refreshApps]);

  useEffect(() => {
    const init = async () => {
      // If initialization has already completed, just set the local state
      if (globalHost && !initPromise) {
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // If another init is in progress, wait for it to finish completely
      if (initPromise) {
        await initPromise;
        setHost(globalHost);
        setIsReady(true);
        return;
      }

      // Prevent double initialization within same render cycle (React Strict Mode)
      if (initRef.current) {
        return;
      }
      initRef.current = true;

      // Create new init promise
      initPromise = (async () => {
        try {
          const origin = window.location.origin;

          // 1. Wait for window.nostr
          const waitForNostr = async (limit: number) => {
            for (let i = 0; i < limit / 100; i++) {
              if ((window as any).nostr) return true;
              await new Promise(r => setTimeout(r, 100));
            }
            return !!(window as any).nostr;
          };
          await waitForNostr(2000);

          const signer = (window as any).nostr;

          // Load relays from localStorage
          let initialRelays = INITIAL_ENABLED_RELAYS;
          try {
            const stored = localStorage.getItem('mirage_relays');
            if (stored) {
              initialRelays = JSON.parse(stored);
            }
          } catch (e) {
            console.warn('[useMirage] Failed to load relays from localStorage', e);
          }

          const mirageHost = new MirageHost({
            relays: initialRelays,
            engineUrl: `${origin}/engine-worker.js`,
            bridgeUrl: `${origin}/bridge.js`,
            signer
          });

          globalHost = mirageHost;
          setHost(mirageHost);
          try {
            if (signer) {
              let pk = '';
              let attempts = 0;
              while (attempts < 3) {
                try {
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
                setPubkey(pk);
                mirageHost.setPubkey(pk);

                // Load initial data
                try {
                  const library = await mirageHost.request('GET', '/mirage/v1/library/apps');

                  if (Array.isArray(library)) setApps(library);
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
    try {
      return await currentHost.fetchApp(naddr);
    } catch (err) {
      console.error('[useMirage] Failed to fetch app:', err);
      return null;
    }
  };

  /**
   * Publish an app to Nostr. 
   * If existingDTag is provided, it updates that event (overwrite/update).
   * Otherwise, it creates a new one.
   */
  const publishApp = async (
    html: string,
    name: string = 'Untitled App',
    existingDTag?: string
  ): Promise<string> => {
    const currentHost = host || globalHost;
    if (!currentHost || !pubkey) throw new Error('Mirage not initialized or no signer found');

    const dTag = existingDTag || `mirage:app:${crypto.randomUUID()}`;

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

    // 2. Generate naddr
    const naddr = nip19.naddrEncode({
      kind: 30078,
      pubkey: pubkey,
      identifier: dTag,
      relays: currentHost.getRelays()
    });

    const appDef: AppDefinition = { naddr, name, createdAt: Date.now() };

    // 3. Save to Library (The engine handles upsert by naddr)
    await currentHost.request('POST', '/mirage/v1/library/apps', appDef);

    // Update local state
    setApps(prevApps => {
      const filtered = prevApps.filter(a => a.naddr !== naddr);
      return [appDef, ...filtered];
    });

    return naddr;
  };

  // Delete an app from the library
  const deleteApp = async (naddr: string): Promise<boolean> => {
    const currentHost = host || globalHost;
    if (!currentHost) {
      console.warn('[useMirage] Cannot delete app: host not ready');
      return false;
    }

    try {
      const result = await currentHost.request('DELETE', '/mirage/v1/library/apps', { naddr });
      if (result.deleted) {
        setApps(prevApps => prevApps.filter(a => a.naddr !== naddr));
        return true;
      }
      return false;
    } catch (e) {
      console.error('[useMirage] Failed to delete app:', e);
      return false;
    }
  };

  return (
    <MirageContext.Provider value={{ host, isReady, pubkey, apps, notification, publishApp, fetchApp, refreshApps, deleteApp }}>
      {!isReady ? (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center p-12 z-[9999]">
          <div className="relative mb-20 scale-125">
            <div className="absolute -inset-10 bg-vivid-cyan rounded-full blur-[80px] opacity-10 animate-pulse" />
            <span className="text-6xl font-black text-transparent bg-clip-text bg-brand-gradient tracking-tighter relative z-10">
              Mirage
            </span>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="w-10 h-10 border border-white/5 border-t-vivid-cyan rounded-full animate-spin" />
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-500 text-[10px] tracking-[0.5em] uppercase font-black mb-3">
                Synchronizing Platform
              </p>
              <p className="text-gray-700 text-xs italic font-light">
                Establishing secure Nostr relay connections...
              </p>
            </div>
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