import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { motion } from 'framer-motion';
import { Home, Share, LayoutGrid, Hammer, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const RunPage = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const { fetchApp, host } = useMirage();
  const containerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Track if we've already loaded this app to prevent re-mounting
  const loadedNaddrRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

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

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-8">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Failed to load app</h1>
        <p className="text-gray-400 mb-8">{error}</p>
        <Link to="/" className="text-accent-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white overflow-hidden flex flex-col">
      {/* App Container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative z-0" />

      {/* Loading Overlay / Skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-12">
          {/* Shimmering Skeleton */}
          <div className="w-full max-w-2xl animate-pulse">
            <div className="h-12 bg-white/5 rounded-2xl mb-8 w-1/3" />
            <div className="space-y-4">
              <div className="h-32 bg-white/5 rounded-3xl" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
              <div className="h-4 bg-white/5 rounded w-4/6" />
            </div>
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-[10px] tracking-widest uppercase font-bold">Synchronizing with Nostr...</p>
          </div>
        </div>
      )}

      {/* Immersive Pill Dock (Top Right, Expandable) */}
      <div className="absolute top-6 right-6 z-20 flex justify-end">
        <motion.div
          layout
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(!isExpanded)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "bg-[#0F0F13]/90 border border-white/10 backdrop-blur-xl rounded-full p-1 shadow-2xl flex items-center overflow-hidden cursor-pointer transition-all duration-300",
            isExpanded ? "max-w-[300px]" : "max-w-[44px]"
          )}
        >
          <div className="flex items-center shrink-0">
            <div className="relative">
              {/* Pulse effect for running status */}
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150" />
              <DockItem icon={LayoutGrid} active tooltip="Mirage Menu" />
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
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
            <div className="flex items-center gap-1 pr-1">
              <Link to="/" onClick={(e) => e.stopPropagation()}>
                <DockItem icon={Home} tooltip="Home" />
              </Link>
              <DockItem icon={Share} tooltip="Share" onClick={handleShare} />
              <DockItem icon={Hammer} tooltip="Edit Source" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const DockItem = ({ icon: Icon, active, tooltip, onClick }: { icon: any, active?: boolean, tooltip: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center transition-all group relative",
      active ? "bg-white text-black" : "text-gray-400 hover:bg-white/10 hover:text-white"
    )}
  >
    <Icon size={18} fill={active ? "currentColor" : "none"} />

    {/* Tooltip */}
    <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
      {tooltip}
    </div>
  </button>
);
