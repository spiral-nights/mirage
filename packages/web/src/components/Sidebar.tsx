import { Home, PlusCircle, Code2, Edit3, Send, XCircle, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAppActions } from '../contexts/AppActionsContext';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-transparent",
      active
        ? "bg-white/5 text-white border-white/10 shadow-lg"
        : "text-gray-500 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={18} className={active ? "text-vivid-cyan" : ""} />
    {label}
  </Link>
);

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-transparent text-gray-500 hover:bg-white/5 hover:text-white w-full"
  >
    <Icon size={18} />
    {label}
  </button>
);

export const Sidebar = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const location = useLocation();
  const { app, space, isAuthor, onViewEditSource, onInvite, onExit } = useAppActions();

  const handleAppAction = (action: (() => void) | null) => {
    if (action) {
      action();
      onNavItemClick?.();
    }
  };

  return (
    <aside className="h-full w-full bg-surface border-r border-white/5 p-6 flex flex-col z-20">
      <div className="mb-12 px-2 hidden md:block">
        <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-brand-gradient tracking-tighter hover:opacity-80 transition-opacity">
          Mirage
        </Link>
      </div>

      <nav className="space-y-6">
        <div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-4 px-2">
            Main
          </div>
          <div className="space-y-1">
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
                label="Create App"
                active={location.pathname === '/create'}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* App Actions - Show when in an app (sidebar itself is hidden on mobile) */}
      {app && (
        <div className="mt-auto pt-8">
          <div className="h-px bg-white/5 mb-6" />
          <div className="space-y-6">
            {space && (
              <div>
                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-3 px-2">
                  Active Space
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10">
                  <Database size={16} className="text-vivid-yellow" />
                  <span className="text-sm font-bold truncate">{space.name}</span>
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-3 px-2">
                {app.naddr === '__preview__' ? 'Preview Actions' : 'App Actions'}
              </div>
              <div className="space-y-1">
                <ActionButton
                  icon={isAuthor ? Edit3 : Code2}
                  label={app.naddr === '__preview__' ? "Edit Source" : (isAuthor ? "Edit Source" : "View Source")}
                  onClick={() => handleAppAction(onViewEditSource)}
                />
                {onInvite && (
                  <ActionButton
                    icon={Send}
                    label="Invite"
                    onClick={() => handleAppAction(onInvite)}
                  />
                )}
                <ActionButton
                  icon={XCircle}
                  label={app.naddr === '__preview__' ? "Cancel Preview" : "Exit App"}
                  onClick={() => handleAppAction(onExit)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
