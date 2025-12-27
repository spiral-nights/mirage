import { Home, Heart, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';

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

export const Sidebar = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const location = useLocation();

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

      <div className="mt-auto">
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          active={location.pathname === '/settings'}
        />
      </div>
    </aside>
  );
};
