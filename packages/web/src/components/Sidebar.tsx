import { Home, Heart, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
      active
        ? "bg-white text-black shadow-lg"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={18} />
    {label}
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1A1A22]/60 border-r border-[#2E2E36] backdrop-blur-2xl p-6 flex flex-col z-20">
      <div className="mb-10 px-2">
        <span className="text-xl font-extrabold bg-accent-gradient bg-clip-text text-transparent">
          Mirage
        </span>
      </div>

      <nav className="space-y-1">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">
          Library
        </div>
        <NavItem
          to="/"
          icon={Home}
          label="My Apps"
          active={location.pathname === '/'}
        />
        <NavItem
          to="/create"
          icon={PlusCircle}
          label="Create App"
          active={location.pathname === '/create'}
        />
        <NavItem
          to="/favorites"
          icon={Heart}
          label="Favorites"
          active={location.pathname === '/favorites'}
        />
      </nav>

      <nav className="mt-auto pt-6 border-t border-[#2E2E36]">
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          active={location.pathname === '/settings'}
        />
      </nav>
    </aside>
  );
};
