import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { useAppActions } from '../contexts/AppActionsContext';
import { XCircle } from 'lucide-react';
import { PublishModal } from '../components/PublishModal';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    mode: 'edit' | 'view';
    initialName: string;
    initialCode: string;
    existingDTag?: string;
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

  // Find app from library
  const currentApp = useMemo(() => {
    return apps.find(a => a.naddr === naddr) || null;
  }, [apps, naddr]);

  const appName = currentApp?.name || 'Mirage App';

  useEffect(() => {
    // Skip if no naddr or host
    if (!naddr || !host || !containerRef.current) return;

    // Skip if already loaded this specific app
    if (loadedNaddrRef.current === naddr) {
      console.log('[RunPage] App already loaded, skipping');
      return;
    }

    let mounted = true;
    isLoadingRef.current = true;

    const loadApp = async () => {
      console.log('[RunPage] Loading app:', naddr.slice(0, 20) + '...');
      setStatus('loading');

      try {
        // 1. Handle URL Hash (Deep Linking)
        const hash = window.location.hash.substring(1);
        if (hash) {
          const params = new URLSearchParams(hash);
          const spaceId = params.get('space');
          const key = params.get('key');
          if (spaceId && key) {
            console.log('[RunPage] Injecting space from URL:', spaceId);
            // Injected via ACTION_SET_SESSION_KEY
            await host.sendToEngine({
              type: 'ACTION_SET_SESSION_KEY',
              id: crypto.randomUUID(),
              spaceId,
              key
            });
          }
        }

        // 2. Fetch App HTML
        const html = await fetchApp(naddr);
        if (!mounted) return;

        if (!html) {
          throw new Error('App not found on relays');
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
        console.log('[RunPage] App loaded successfully');

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
    };
  }, [naddr, host]); // Only depend on naddr and host, not fetchApp

  const handleShare = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Current base URL
    const url = new URL(window.location.href);

    // We should ideally fetch the current space from the engine
    // For now, if we have a space in the hash, we keep it
    navigator.clipboard.writeText(url.toString());
    alert('Share link copied to clipboard!');
  }, []);

  const handleOpenSource = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!naddr) return;

    try {
      const code = await fetchApp(naddr);
      if (!code) throw new Error("Could not fetch app source");

      const { data } = nip19.decode(naddr) as { data: { identifier: string } };

      setModalProps({
        mode: isAuthor ? 'edit' : 'view',
        initialName: appName,
        initialCode: code,
        existingDTag: data.identifier
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
    if (currentApp) {
      setAppActions({
        app: currentApp,
        space: spaceId ? { id: spaceId, name: spaceName || 'Unnamed Space' } : null,
        isAuthor,
        onViewEditSource: handleOpenSource,
        onShare: handleShare,
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
        onShare: null,
        onExit: null,
      });
    };
  }, [currentApp, spaceId, spaceName, isAuthor, handleOpenSource, handleShare, handleExit, setAppActions]);

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
    <div className="fixed top-16 md:top-0 left-0 md:left-64 right-0 bottom-0 bg-background overflow-hidden flex flex-col">
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
    </div>
  );
};
