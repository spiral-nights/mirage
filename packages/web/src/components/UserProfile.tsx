import { useState } from 'react';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface UserProfileProps {
  compact?: boolean;
  direction?: 'up' | 'down';
  align?: 'left' | 'right';
}

export const UserProfile = ({ compact = false, direction = 'down', align = 'right' }: UserProfileProps) => {
  const { pubkey, logout, profile } = useMirage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const displayName = profile?.displayName || profile?.name || (pubkey ? `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}` : 'Unknown');

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 outline-none w-full",
          compact ? "justify-center" : ""
        )}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0 ring-1 ring-white/10">
          {profile?.picture ? (
            <img src={profile.picture} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-gray-400" />
          )}
        </div>

        {/* Desktop: Show Name and Chevron */}
        {!compact && (
          <div className="hidden md:flex items-center gap-2 flex-1 justify-between min-w-0">
            <span className="text-sm font-medium text-gray-200 truncate">
              {displayName}
            </span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute w-56 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-[100]",
              direction === 'up' ? "bottom-full mb-2" : "top-full mt-2",
              align === 'left' ? "left-0" : "right-0"
            )}
          >
            {/* Mobile: Show Name in dropdown header */}
            {/* Also show on desktop if compact mode is enabled (since name is hidden) */}
            <div className={cn(
              "px-3 py-2 border-b border-white/5 mb-1",
              !compact ? "md:hidden" : ""
            )}>
              <span className="text-sm font-bold text-white block truncate">
                {displayName}
              </span>
              {pubkey && (
                <span className="text-xs text-gray-500 block truncate font-mono">
                  {pubkey}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left outline-none"
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left outline-none"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};