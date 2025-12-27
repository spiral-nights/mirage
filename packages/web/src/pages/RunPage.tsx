import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { motion } from 'framer-motion';
import { Home, Share, LayoutGrid, Hammer, XCircle, Code2, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { PublishModal } from '../components/PublishModal';
import { nip19 } from 'nostr-tools';

export const RunPage = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const { fetchApp, host, pubkey, apps } = useMirage();
  const containerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

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

  // Find app name from library if available
  const appName = useMemo(() => {
    return apps.find(a => a.naddr === naddr)?.name || 'Mirage App';
  }, [apps, naddr]);

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
        await host.mount(html, containerRef.current!, naddr);

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

  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Current base URL
    const url = new URL(window.location.href);

    // We should ideally fetch the current space from the engine
    // For now, if we have a space in the hash, we keep it
    navigator.clipboard.writeText(url.toString());
    alert('Share link copied to clipboard!');
  };

  const handleOpenSource = async (e?: React.MouseEvent) => {
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
  };

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-8">
        <XCircle size={64} className="text-vivid-magenta mb-6" />
        <h1 className="text-3xl font-black mb-3 tracking-tight">App failure.</h1>
        <p className="text-gray-500 font-light italic mb-10 max-w-sm">{error}</p>
        <Link to="/" className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all transition-all">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
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

      {/* Immersive Pill Dock (Top Right, Expandable) */}
      <div className="absolute top-8 right-8 z-20 flex justify-end">
        <motion.div
          layout
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(!isExpanded)}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "bg-[#050505]/80 border border-white/5 backdrop-blur-3xl rounded-3xl p-1.5 shadow-2xl flex items-center overflow-hidden cursor-pointer transition-all duration-500",
            isExpanded ? "max-w-[440px] px-3 border-vivid-magenta/20 shadow-vivid-glow" : "max-w-[48px]"
          )}
        >
          <div className="flex items-center shrink-0">
            <div className="relative">
              {/* Pulse effect for running status */}
              <div className="absolute inset-0 bg-vivid-magenta rounded-full animate-ping opacity-20 scale-150" />
              <div className="w-9 h-9 rounded-2xl bg-vivid-magenta flex items-center justify-center text-white shadow-vivid-glow z-10 relative">
                <LayoutGrid size={18} />
              </div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{
              width: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            className="flex items-center"
          >
            <div className="w-px h-5 bg-white/5 mx-3 shrink-0" />
            <div className="flex items-center gap-1.5 pr-2">
              <Link to="/" onClick={(e) => e.stopPropagation()}>
                <DockItem icon={Home} tooltip="Library" />
              </Link>
              <div className="w-px h-5 bg-white/5 mx-1.5 shrink-0" />

              <DockItem
                icon={isAuthor ? Edit3 : Code2}
                tooltip={isAuthor ? "Edit Source" : "View Source"}
                onClick={handleOpenSource}
              />
              <DockItem icon={Share} tooltip="Share Entry" onClick={handleShare} />
              <DockItem icon={Hammer} tooltip="Debugger" />

              <div className="w-px h-5 bg-white/5 mx-1.5 shrink-0" />
              <Link to="/" onClick={(e) => e.stopPropagation()}>
                <DockItem icon={XCircle} tooltip="Exit App" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal for Edit/View Source */}
      <PublishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        {...modalProps}
      />
    </div>
  );
};

const DockItem = ({ icon: Icon, active, tooltip, onClick }: { icon: any, active?: boolean, tooltip: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-9 h-9 rounded-2xl flex items-center justify-center transition-all group relative border border-transparent",
      active
        ? "bg-vivid-magenta/20 text-vivid-magenta border-vivid-magenta/20"
        : "text-gray-500 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={16} />

    {/* Tooltip */}
    <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/5 scale-90 group-hover:scale-100">
      {tooltip}
    </div>
  </button>
);
