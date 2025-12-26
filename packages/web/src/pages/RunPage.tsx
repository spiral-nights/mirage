import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { motion } from 'framer-motion';
import { Home, Share, Play, Hammer, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const RunPage = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const { fetchApp, host } = useMirage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadApp = async () => {
      if (!naddr || !host || !containerRef.current) return;

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

        // 3. Mount the app
        await host.mount(html, containerRef.current);
        setStatus('running');

      } catch (err) {
        if (!mounted) return;
        console.error('Failed to run app:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    loadApp();

    return () => {
      mounted = false;
    };
  }, [naddr, host, fetchApp]);

  const handleShare = () => {
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

      {/* Immersive Pill Dock */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="bg-[#0F0F13]/90 border border-white/10 backdrop-blur-xl rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl">
          <DockItem icon={Play} active tooltip="Running" />
          <div className="w-px h-5 bg-white/10 mx-1" />
          <Link to="/">
            <DockItem icon={Home} tooltip="Home" />
          </Link>
          <DockItem icon={Share} tooltip="Share" onClick={handleShare} />
          <DockItem icon={Hammer} tooltip="Edit Source" />
        </div>
      </motion.div>
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
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {tooltip}
    </div>
  </button>
);
