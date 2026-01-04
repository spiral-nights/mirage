import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { MirageHost } from '@mirage/host';
import { type AppDefinition } from '@mirage/core';
import { nip19 } from 'nostr-tools';
import { INITIAL_ENABLED_RELAYS } from '../lib/relays';
import { LoginModal } from '../components/LoginModal';

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
  logout: () => void;
}

const MirageContext = createContext<MirageContextType | undefined>(undefined);

// Singleton to prevent double initialization in React Strict Mode
let globalHost: MirageHost | null = null;
let initPromise: Promise<void> | null = null;

export const MirageProvider = ({ children }: { children: ReactNode }) => {
  const [host, setHost] = useState<MirageHost | null>(globalHost);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [apps, setApps] = useState<AppDefinition[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const initRef = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem('mirage_identity_v1');
    (window as any).nostr = undefined;
    setPubkey(null);
    setShowLogin(true);
  }, []);

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
        if (!pubkey && !(window as any).nostr) {
           setShowLogin(true);
        }
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

          // 1. Try to detect NIP-07 extension
          const waitForNostr = async (limit: number) => {
            if ((window as any).nostr) return true;
            for (let i = 0; i < limit / 100; i++) {
              if ((window as any).nostr) return true;
              await new Promise(r => setTimeout(r, 100));
            }
            return !!(window as any).nostr;
          };
          await waitForNostr(500);

          const signer = (window as any).nostr;

          // 2. Decide if we show login
          if (!signer) {
              setShowLogin(true);
          } else {
              try {
                  const pk = await signer.getPublicKey();
                  setPubkey(pk);
              } catch (e) {
                  setShowLogin(true);
              }
          }

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
            signer: (window as any).nostr
          });

          globalHost = mirageHost;
          setHost(mirageHost);

          if ((window as any).nostr) {
             const pk = await (window as any).nostr.getPublicKey();
             mirageHost.setPubkey(pk);
             setPubkey(pk);

             // Load initial data
             try {
               const library = await mirageHost.request('GET', '/mirage/v1/library/apps');
               if (Array.isArray(library)) setApps(library);
             } catch (dataErr) {
               console.warn('[useMirage] Initial data fetch failed:', dataErr);
             }
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

  const handleLoginSuccess = useCallback(async (pk: string) => {
      setPubkey(pk);
      setShowLogin(false);
      
      const currentHost = host || globalHost;
      if (currentHost) {
          const signer = (window as any).nostr;
          if (signer) {
              currentHost.setSigner(signer);
          }
          currentHost.setPubkey(pk);
          try {
              const library = await currentHost.request('GET', '/mirage/v1/library/apps');
              if (Array.isArray(library)) setApps(library);
          } catch (e) {
              console.warn('[useMirage] Data fetch after login failed:', e);
          }
      }
  }, [host]);

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

    // 3. Save to Library
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
    if (!currentHost) return false;

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
    <MirageContext.Provider value={{ host, isReady, pubkey, apps, notification, publishApp, fetchApp, refreshApps, deleteApp, logout }}>
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
        <>
            {showLogin && <LoginModal isOpen={true} onSuccess={handleLoginSuccess} />}
            {children}
        </>
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
