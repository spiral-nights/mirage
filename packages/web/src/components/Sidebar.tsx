import { Home, PlusCircle, Code2, Edit3, Share, XCircle, Database, Plus, Folder } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAppActions } from '../contexts/AppActionsContext';
import { useSpaces } from '../hooks/useSpaces';
import { useState } from 'react';
import { CreateSpaceModal } from './CreateSpaceModal';

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
  const { app, space, isAuthor, onViewEditSource, onShare, onExit } = useAppActions();
  const { spaces, deleteSpace } = useSpaces();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

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

      <nav className="space-y-6">
        <div>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">
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

        {/* Spaces Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
              Your Spaces
            </div>
            <button
              onClick={() => setCreateSpaceOpen(true)}
              className="text-gray-600 hover:text-white transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-2 scrollbar-none">
            {spaces.length > 0 ? (
              spaces.map(s => (
                <div key={s.id} className="group/space relative" onClick={onNavItemClick}>
                  <Link
                    to={`/run/${s.appOrigin}?spaceId=${s.id}&spaceName=${encodeURIComponent(s.name)}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm border border-transparent",
                      location.search.includes(`spaceId=${s.id}`)
                        ? "bg-vivid-cyan/10 text-vivid-cyan border-vivid-cyan/20"
                        : "text-gray-500 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Folder size={16} className={location.search.includes(`spaceId=${s.id}`) ? "text-vivid-cyan" : "text-gray-600 group-hover/space:text-vivid-cyan transition-colors"} />
                    <span className="truncate flex-1">{s.name}</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(`Delete space "${s.name}"?`)) {
                        deleteSpace(s.id);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover/space:opacity-100"
                  >
                    <XCircle size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 border border-dashed border-white/5 rounded-xl text-[10px] text-gray-600 text-center italic">
                No spaces created yet
              </div>
            )}
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
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-3 px-2">
                  Active Space
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-vivid-cyan/10 text-vivid-cyan border border-vivid-cyan/20">
                  <Database size={16} />
                  <span className="text-sm font-bold truncate">{space.name}</span>
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-3 px-2">
                {app.naddr === '__preview__' ? 'Preview Actions' : 'App Actions'}
              </div>
              <div className="space-y-1">
                <ActionButton
                  icon={isAuthor ? Edit3 : Code2}
                  label={app.naddr === '__preview__' ? "Edit Source" : (isAuthor ? "Edit Source" : "View Source")}
                  onClick={() => handleAppAction(onViewEditSource)}
                />
                {onShare && (
                  <ActionButton
                    icon={Share}
                    label="Share"
                    onClick={() => handleAppAction(onShare)}
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

      <CreateSpaceModal
        isOpen={createSpaceOpen}
        onClose={() => setCreateSpaceOpen(false)}
      />
    </aside>
  );
};
