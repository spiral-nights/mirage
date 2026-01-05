import { Home, PlusCircle, Code2, Edit3, Send, XCircle, Database, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAppActions } from '../contexts/AppActionsContext';
import { UserProfile } from './UserProfile';

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

const NavItem = ({ to, icon: Icon, label, active, collapsed }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 py-3 rounded-xl transition-all font-semibold text-sm border border-transparent whitespace-nowrap",
      active
        ? "bg-white/5 text-white border-white/10 shadow-lg"
        : "text-gray-500 hover:bg-white/5 hover:text-white",
      collapsed ? "justify-center px-2" : "px-4"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={18} className={active ? "text-vivid-cyan" : ""} />
    {!collapsed && <span>{label}</span>}
  </Link>
);

interface ActionButtonProps {
  icon: any;
  label: string;
  onClick: () => void;
  collapsed?: boolean;
}

const ActionButton = ({ icon: Icon, label, onClick, collapsed }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 py-3 rounded-xl transition-all font-semibold text-sm border border-transparent text-gray-500 hover:bg-white/5 hover:text-white w-full whitespace-nowrap",
      collapsed ? "justify-center px-2" : "px-4"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={18} />
    {!collapsed && <span>{label}</span>}
  </button>
);

interface SidebarProps {
  onNavItemClick?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ onNavItemClick, collapsed = false, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { app, space, isAuthor, onViewEditSource, onInvite, onExit } = useAppActions();

  const handleAppAction = (action: (() => void) | null) => {
    if (action) {
      action();
      onNavItemClick?.();
    }
  };

  return (
    <aside className="h-full w-full bg-surface border-r border-white/5 flex flex-col z-20 overflow-hidden">
      {/* Header: Logo & Toggle */}
      <div className={cn("flex items-center p-6 h-20", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link
            to="/"
            onClick={onNavItemClick}
            className="text-2xl font-black text-transparent bg-clip-text bg-brand-gradient tracking-tighter hover:opacity-80 transition-opacity"
          >
            Mirage
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto overflow-x-hidden min-h-0">
        <nav className="space-y-6">
          <div>
            {!collapsed && (
              <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-4 px-2">
                Main
              </div>
            )}
            <div className="space-y-1">
              <div onClick={onNavItemClick}>
                <NavItem
                  to="/"
                  icon={Home}
                  label="Library"
                  active={location.pathname === '/'}
                  collapsed={collapsed}
                />
              </div>
              <div onClick={onNavItemClick}>
                <NavItem
                  to="/create"
                  icon={PlusCircle}
                  label="Create App"
                  active={location.pathname === '/create'}
                  collapsed={collapsed}
                />
              </div>
              <div onClick={onNavItemClick}>
                <NavItem
                  to="/help"
                  icon={HelpCircle}
                  label="Help & Guide"
                  active={location.pathname === '/help'}
                  collapsed={collapsed}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* App Actions */}
        {app && (
          <div className="mt-8">
            <div className="h-px bg-white/5 mb-6" />
            <div className="space-y-6">
              {space && (
                <div>
                  {!collapsed && (
                    <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-3 px-2">
                      Active Space
                    </div>
                  )}
                  <div className={cn(
                    "flex items-center gap-3 rounded-xl bg-white/5 text-white border border-white/10 overflow-hidden",
                    collapsed ? "justify-center p-2" : "px-4 py-3"
                  )} title={collapsed ? `${app.name} (${space.name})` : undefined}>
                    <Database size={16} className="text-vivid-yellow shrink-0" />
                    {!collapsed && (
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate leading-tight">{app.name}</span>
                        <span className="text-sm font-bold truncate leading-tight">{space.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                {!collapsed && (
                  <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-3 px-2">
                    {app.naddr === '__preview__' ? 'Preview Actions' : 'App Actions'}
                  </div>
                )}
                <div className="space-y-1">
                  <ActionButton
                    icon={isAuthor ? Edit3 : Code2}
                    label={app.naddr === '__preview__' ? "Edit Source" : (isAuthor ? "Edit Source" : "View App Info")}
                    onClick={() => handleAppAction(onViewEditSource)}
                    collapsed={collapsed}
                  />
                  {onInvite && (
                    <ActionButton
                      icon={Send}
                      label="Invite"
                      onClick={() => handleAppAction(onInvite)}
                      collapsed={collapsed}
                    />
                  )}
                  <ActionButton
                    icon={XCircle}
                    label={app.naddr === '__preview__' ? "Cancel Preview" : "Exit App"}
                    onClick={() => handleAppAction(onExit)}
                    collapsed={collapsed}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 mt-auto">
        <UserProfile
          compact={collapsed}
          direction="up"
          align="left"
          onSettingsClick={onNavItemClick}
        />
      </div>
    </aside>
  );
};
