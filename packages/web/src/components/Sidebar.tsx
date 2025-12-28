import { Home, Heart, Settings, PlusCircle, Code2, Edit3, Share, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAppActions } from '../contexts/AppActionsContext';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border border-transparent",
      active
        ? "bg-vivid-magenta/10 text-vivid-magenta border-vivid-magenta/20 shadow-vivid-glow"
        : "text-gray-500 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={18} className={active ? "text-vivid-magenta" : ""} />
    {label}
  </Link>
);

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border border-transparent text-gray-500 hover:bg-white/5 hover:text-white w-full"
  >
    <Icon size={18} />
    {label}
  </button>
);

export const Sidebar = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const location = useLocation();
  const { app, isAuthor, onViewEditSource, onShare, onExit } = useAppActions();

  const handleAppAction = (action: (() => void) | null) => {
    if (action) {
      action();
      onNavItemClick?.();
    }
  };

  return (
    <aside className="h-full w-full bg-card/60 border-r border-white/5 backdrop-blur-2xl p-6 flex flex-col z-20">
      <div className="mb-12 px-2 hidden md:block">
        <span className="text-2xl font-black vivid-text tracking-tighter">
          Mirage
        </span>
      </div>

      <nav className="space-y-2">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">
          Apps & Spaces
        </div>
        <div onClick={onNavItemClick}>
          <NavItem
            to="/"
            icon={Home}
            label="Library"
            active={location.pathname === '/'}
          />
        </div>
        <div onClick={onNavItemClick}>
          <NavItem
            to="/create"
            icon={PlusCircle}
            label="Connect App"
            active={location.pathname === '/create'}
          />
        </div>
        <div onClick={onNavItemClick}>
          <NavItem
            to="/favorites"
            icon={Heart}
            label="Favorites"
            active={location.pathname === '/favorites'}
          />
        </div>
      </nav>

      {/* App Actions - Only show on mobile when in an app */}
      {app && (
        <div className="md:hidden mt-8">
          <div className="h-px bg-white/5 mb-6" />
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">
              App Actions
            </div>
            <ActionButton
              icon={isAuthor ? Edit3 : Code2}
              label={isAuthor ? "Edit Source" : "View Source"}
              onClick={() => handleAppAction(onViewEditSource)}
            />
            <ActionButton
              icon={Share}
              label="Share"
              onClick={() => handleAppAction(onShare)}
            />
            <ActionButton
              icon={XCircle}
              label="Exit App"
              onClick={() => handleAppAction(onExit)}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
