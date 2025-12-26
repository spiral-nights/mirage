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
        const html = await fetchApp(naddr);
        if (!mounted) return;
        
        if (!html) {
          throw new Error('App not found');
        }

        // Mount the app using the Host Engine
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
      // host.unmount(); // TODO: Implement unmount safely
    };
  }, [naddr, host, fetchApp]);

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

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm tracking-widest uppercase">Booting Mirage Engine...</p>
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
          <DockItem icon={Share} tooltip="Share" />
          <DockItem icon={Hammer} tooltip="Edit Source" />
        </div>
      </motion.div>
    </div>
  );
};

const DockItem = ({ icon: Icon, active, tooltip }: { icon: any, active?: boolean, tooltip: string }) => (
  <button 
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
