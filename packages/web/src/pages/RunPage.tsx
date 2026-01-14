import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { useAppActions } from '../contexts/AppActionsContext';
import type { AppDefinition } from '@mirage/core';
import { XCircle } from 'lucide-react';
import { PublishModal } from '../components/PublishModal';
import { InviteModal } from '../components/InviteModal';
import { nip19 } from 'nostr-tools';

export const RunPage = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchApp, host, pubkey, apps } = useMirage();
  const { setAppActions } = useAppActions();
  const containerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const spaceId = searchParams.get('spaceId');
  const spaceName = searchParams.get('spaceName');

  // Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSpaceId, setInviteSpaceId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    mode: 'edit' | 'view';
    initialName: string;
    initialCode: string;
    existingDTag?: string;
    authorPubkey?: string;
  }>({ mode: 'view', initialName: '', initialCode: '' });

  // Track if we've already loaded this app to prevent re-mounting
  const loadedNaddrRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Check if current user is the author
  const isAuthor = useMemo(() => {
    if (!naddr || !pubkey) return false;
    try {
      const decoded = nip19.decode(naddr) as { data: { pubkey: string } };
      return decoded.data.pubkey === pubkey;
    } catch (e) {
      return false;
    }
  }, [naddr, pubkey]);

  // State for external app name resolution
  const [resolvedAppName, setResolvedAppName] = useState<string | null>(null);

  // Find app from library
  const currentApp = useMemo(() => {
    return apps.find(a => a.naddr === naddr) || null;
  }, [apps, naddr]);

  // Construct effective app definition (library app or external fallback)
  const activeApp = useMemo<AppDefinition | null>(() => {
    if (currentApp) return currentApp;
    if (naddr) {
      return {
        naddr,
        name: resolvedAppName || 'External App',
        createdAt: 0
      };
    }
    return null;
  }, [currentApp, naddr, resolvedAppName]);

  const appName = activeApp?.name || 'Mirage App';

  useEffect(() => {
    // Skip if no naddr or host
    if (!naddr || !host || !containerRef.current) return;

    // Skip if already loaded this specific app
    if (loadedNaddrRef.current === naddr) {
      return;
    }

    let mounted = true;
    isLoadingRef.current = true;

    const loadApp = async () => {
      setStatus('loading');

      try {
        // 2. Fetch App HTML
        const html = await fetchApp(naddr);
        if (!mounted) return;

        if (!html) {
          throw new Error('App not found on relays');
        }

        // Try to resolve name from HTML title if external
        if (!currentApp) {
          const match = html.match(/<title>(.*?)<\/title>/i);
          if (match && match[1]) {
            setResolvedAppName(match[1].trim());
          }
        }

        // 3. Mount the app with its naddr for space scoping
        await host.mount(html, containerRef.current!, {
          appId: naddr,
          spaceId: spaceId || undefined,
          spaceName: spaceName || undefined
        });

        if (!mounted) return;

        loadedNaddrRef.current = naddr;
        setStatus('running');

      } catch (err) {
        if (!mounted) return;
        console.error('Failed to run app:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadApp();

    return () => {
      mounted = false;
      // Reset appOrigin and space context when navigating away
      host?.unmount();
    };
  }, [naddr, host]); // Only depend on naddr and host, not fetchApp

  const handleInvite = useCallback((targetSpaceId?: string) => {
    // If targetSpaceId provided, use it. Otherwise use current spaceId.
    if (targetSpaceId) {
      setInviteSpaceId(targetSpaceId);
      setInviteModalOpen(true);
    } else if (spaceId) {
      setInviteSpaceId(spaceId);
      setInviteModalOpen(true);
    } else {
      alert("No active space to invite to.");
    }
  }, [spaceId]);

  const handleOpenSource = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!naddr) return;

    try {
      const code = await fetchApp(naddr);
      if (!code) throw new Error("Could not fetch app source");

      const { data } = nip19.decode(naddr) as { data: { identifier: string; pubkey: string } };

      setModalProps({
        mode: isAuthor ? 'edit' : 'view',
        initialName: appName,
        initialCode: code,
        existingDTag: data.identifier,
        authorPubkey: data.pubkey
      });
      setModalOpen(true);
    } catch (e) {
      console.error("Failed to open source:", e);
      alert("Failed to load application source from relays.");
    }
  }, [naddr, fetchApp, isAuthor, appName]);

  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Update context whenever app data changes
  useEffect(() => {
    if (activeApp) {
      setAppActions({
        app: activeApp,
        space: spaceId ? { id: spaceId, name: spaceName || 'Unnamed Space' } : null,
        isAuthor,
        onViewEditSource: handleOpenSource,
        onInvite: handleInvite,
        onExit: handleExit,
      });
    }

    // Clear context when leaving
    return () => {
      setAppActions({
        app: null,
        space: null,
        isAuthor: false,
        onViewEditSource: null,
        onInvite: null,
        onExit: null,
      });
    };
  }, [currentApp, spaceId, spaceName, isAuthor, handleOpenSource, handleInvite, handleExit, setAppActions]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-8">
        <XCircle size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black mb-3 tracking-tight">App failure.</h1>
        <p className="text-gray-500 font-light italic mb-10 max-w-sm">{error}</p>
        <Link to="/" className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all transition-all">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background overflow-hidden flex flex-col relative">
      {/* App Container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative z-0" />

      {/* Loading Overlay / Skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-[#050505] z-10 flex flex-col items-center justify-center p-12">
          {/* Shimmering Skeleton */}
          <div className="w-full max-w-3xl animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl mb-12 w-1/4" />
            <div className="space-y-6">
              <div className="h-48 bg-white/5 rounded-[40px]" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6 opacity-50" />
            </div>
            <div className="mt-16 grid grid-cols-3 gap-6">
              <div className="h-32 bg-white/5 rounded-3xl" />
              <div className="h-32 bg-white/5 rounded-3xl" />
              <div className="h-32 bg-white/5 rounded-3xl" />
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center">
            <div className="w-12 h-12 border border-vivid-cyan/30 border-t-vivid-cyan rounded-full animate-spin mb-6" />
            <p className="text-gray-600 text-[10px] tracking-[0.4em] uppercase font-black">Connecting Cluster...</p>
          </div>
        </div>
      )}

      {/* Modal for Edit/View Source */}
      <PublishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        returnTo={`/run/${naddr}`}
        {...modalProps}
      />

      {/* Invite Modal */}
      {spaceId && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          spaceId={inviteSpaceId || spaceId || ''}
          spaceName={spaceName || 'Unnamed Space'}
        />
      )}
    </div>
  );
};
