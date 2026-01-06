import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { UserProfile } from '../components/UserProfile';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useMirage } from '../hooks/useMirage';
import { useWakeLock } from '../hooks/useWakeLock';
import { useAppSettings } from '../hooks/useAppSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const RootLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { notification } = useMirage();
  const location = useLocation();
  const { settings } = useAppSettings();

  // Enable wake lock if setting is true
  useWakeLock(settings.wakeLockEnabled);

  const isFullWidthPage = location.pathname.startsWith('/run/') || location.pathname === '/preview';

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-white overflow-hidden relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[1000] bg-white text-black px-6 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-4 border-2 border-white"
          >
            <div className="w-3 h-3 bg-vivid-magenta rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
            <span className="uppercase tracking-widest text-xs">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/60 border-b border-white/5 backdrop-blur-xl z-[200] px-4 grid grid-cols-3 items-center">
        {/* Left: Hamburger */}
        <div className="flex justify-start">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link to="/" className="text-xl font-black text-transparent bg-clip-text bg-brand-gradient tracking-tighter">
            Mirage
          </Link>
        </div>

        {/* Right: Profile */}
        <div className="flex justify-end">
          <UserProfile />
        </div>
      </div>

      {/* Sidebar - Persistent on desktop, Slide-over on mobile */}
      <div
        className={cn(
          "fixed top-16 md:top-0 left-0 right-0 bottom-0 md:relative z-[150] transition-all duration-300 ease-in-out bg-surface md:bg-transparent",
          mobileMenuOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto",
          collapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className="relative h-full w-full">
          <Sidebar
            onNavItemClick={() => setMobileMenuOpen(false)}
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>
      </div>

      <main className={cn(
        "flex-1 overflow-y-auto relative z-10 transition-all duration-300",
        isFullWidthPage ? "p-0 pt-16 md:pt-0" : "p-6 md:p-12 md:pt-12 pt-24"
      )}>
        <Outlet />
      </main>
    </div>
  );
};