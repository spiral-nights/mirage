import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { cn } from '../lib/utils';
import {
  LayoutGrid,
  Play,
  Trash2,
  AlertCircle,
  Database,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Package
} from 'lucide-react';
import { type AppDefinition } from '@mirage/core';

interface SpaceWithApp {
  id: string;
  name: string;
  createdAt: number;
  memberCount: number;
  appOrigin?: string;
}

export const MyAppsPage = () => {
  const { apps, spaces, isReady, deleteApp, deleteSpace } = useMirage();

  // Group spaces by their parent app
  const { appSpaces, orphanSpaces } = useMemo(() => {
    const appSpaceMap = new Map<string, SpaceWithApp[]>();
    const orphans: SpaceWithApp[] = [];

    for (const space of spaces as SpaceWithApp[]) {
      if (!space.appOrigin || space.appOrigin === 'mirage-app' || space.appOrigin === 'mirage-studio') {
        orphans.push(space);
      } else {
        const existing = appSpaceMap.get(space.appOrigin) || [];
        existing.push(space);
        appSpaceMap.set(space.appOrigin, existing);
      }
    }

    return { appSpaces: appSpaceMap, orphanSpaces: orphans };
  }, [spaces, apps]);

  // Loading state
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
        <div className="w-full max-w-4xl animate-pulse">
          <div className="h-16 bg-white/5 rounded-2xl mb-8 w-1/3" />
          <div className="h-4 bg-white/5 rounded w-2/3 mb-16" />

          <div className="grid grid-cols-1 gap-6 mb-16">
            <div className="h-32 bg-white/5 rounded-3xl" />
            <div className="h-32 bg-white/5 rounded-3xl" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="w-10 h-10 border border-vivid-magenta/30 border-t-vivid-magenta rounded-full animate-spin mb-4" />
          <p className="text-gray-600 text-[10px] tracking-[0.3em] uppercase font-bold">Synchronizing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-20">
        <h1 className="text-6xl font-black mb-6 tracking-tight">
          Your <span className="serif-italic px-2">Library</span>
        </h1>
        <p className="text-gray-400 text-xl font-light max-w-2xl leading-relaxed">
          Manage your decentralized applications and their secure data spaces in one place.
        </p>
      </header>

      {/* Apps with their spaces */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold flex items-center gap-3 text-gray-500 uppercase tracking-[0.2em]">
            <LayoutGrid size={16} className="text-vivid-magenta" />
            Active Applications
            <span className="text-xs text-vivid-magenta/50 ml-2">{apps.length}</span>
          </h2>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-20 bg-card/40 border border-white/5 rounded-[40px] backdrop-blur-sm">
            <Sparkles size={40} className="text-gray-700 mx-auto mb-6" />
            <p className="text-gray-400 font-medium mb-1">No applications connected</p>
            <p className="text-gray-600 text-sm">Explore and connect apps to start building your library.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {apps.map((app, i) => (
              <AppWithSpaces
                key={app.naddr}
                app={app}
                index={i}
                spaces={appSpaces.get(app.naddr) || []}
                onDeleteApp={deleteApp}
                onDeleteSpace={deleteSpace}
              />
            ))}
          </div>
        )}
      </section>

      {/* Orphan spaces (no associated app or generic mirage-app) */}
      {orphanSpaces.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold flex items-center gap-3 text-gray-500 uppercase tracking-[0.2em]">
              <Package size={16} className="text-gray-600" />
              Legacy Data Spaces
              <span className="text-xs text-gray-600 ml-2">{orphanSpaces.length}</span>
            </h2>
          </div>

          <div className="bg-card/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm">
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              These spaces were created before app-specific storage was enabled. They are not associated with any specific app.
            </p>
            <div className="space-y-3">
              {orphanSpaces.map((space, i) => (
                <OrphanSpaceRow key={space.id} space={space} index={i} onDelete={deleteSpace} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const AppWithSpaces = ({
  app,
  index,
  spaces,
  onDeleteApp,
  onDeleteSpace
}: {
  app: AppDefinition;
  index: number;
  spaces: SpaceWithApp[];
  onDeleteApp: (naddr: string) => Promise<boolean>;
  onDeleteSpace: (spaceId: string) => Promise<boolean>;
}) => {
  const [isExpanded, setIsExpanded] = useState(spaces.length > 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteApp = async () => {
    setIsDeleting(true);
    await onDeleteApp(app.naddr);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: "easeOut" }}
      className="bg-card/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm group/card hover:border-vivid-magenta/20 transition-all duration-500 hover:shadow-vivid-glow"
    >
      {/* App Header */}
      <div className="p-6 relative">
        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md rounded-t-[32px] flex items-center justify-between px-10 z-20"
            >
              <div className="flex items-center gap-4">
                <AlertCircle size={22} className="text-vivid-magenta" />
                <span className="text-lg font-medium">Remove from library?</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Keep It
                </button>
                <button
                  onClick={handleDeleteApp}
                  className="px-6 py-2.5 rounded-2xl bg-vivid-magenta text-white hover:bg-vivid-magenta/80 transition-colors flex items-center gap-2 font-bold shadow-vivid-glow"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Remove
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-tr from-[#0D0D12] to-[#1F1F26] border border-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover/card:border-vivid-magenta/30 transition-all duration-500">
            {app.name.charAt(0) || '🚀'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-black truncate group-hover/card:text-vivid-magenta transition-colors duration-500">
                {app.name}
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] text-vivid-magenta bg-vivid-magenta/10 border border-vivid-magenta/20 px-3 py-1 rounded-full uppercase font-black tracking-widest">
                <Sparkles size={10} fill="currentColor" />
                Verified
              </span>
              {spaces.length > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] text-vivid-cyan bg-vivid-cyan/10 border border-vivid-cyan/20 px-3 py-1 rounded-full uppercase font-black tracking-widest">
                  <Database size={10} />
                  {spaces.length} Storage
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-light italic">
              Added {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 hover:text-vivid-magenta transition-all opacity-0 group-hover/card:opacity-100"
            >
              <Trash2 size={18} />
            </button>

            <Link
              to={`/run/${app.naddr}`}
              className="h-11 px-6 rounded-2xl bg-vivid-magenta text-white hover:opacity-90 transition-all flex items-center gap-3 font-black text-sm shadow-vivid-glow active:scale-95 translate-y-0 hover:-translate-y-0.5"
            >
              <Play size={16} fill="currentColor" />
              Launch
            </Link>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 transition-all",
                isExpanded && "bg-white/10 text-white"
              )}
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Spaces Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">
              {spaces.length > 0 ? (
                <div className="space-y-2.5 p-4 bg-black/20 rounded-[24px] border border-white/5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                    <Database size={12} className="text-vivid-cyan" />
                    Encrypted Data Clusters
                  </p>
                  {spaces.map((space, i) => (
                    <SpaceRow key={space.id} space={space} index={i} onDelete={onDeleteSpace} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-black/20 rounded-[24px] border border-dashed border-white/5">
                  <p className="text-sm text-gray-600 font-light italic">
                    No data spaces detected for this integration.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SpaceRow = ({
  space,
  onDelete
}: {
  space: SpaceWithApp;
  index: number;
  onDelete: (spaceId: string) => Promise<boolean>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(space.id);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  const isUnnamed = !space.name || space.name.startsWith('Space ');

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-vivid-cyan/5 border border-transparent hover:border-vivid-cyan/10 transition-all duration-300">
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute inset-0 bg-[#050505]/98 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 z-10 border border-vivid-magenta/20 shadow-vivid-glow"
          >
            <span className="text-xs font-bold text-gray-400">Permanently delete space?</span>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-white/5 hover:bg-white/10"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-vivid-magenta text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-8 h-8 rounded-xl bg-vivid-cyan/10 border border-vivid-cyan/20 flex items-center justify-center text-vivid-cyan shrink-0 transition-transform group-hover:scale-110">
        <Database size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm font-medium transition-colors group-hover:text-vivid-cyan truncate block",
          isUnnamed ? 'text-gray-500 italic font-light' : 'text-gray-300'
        )}>
          {space.name}
        </span>
      </div>

      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-gray-600 font-mono tracking-wider uppercase">
        #{space.id.slice(0, 6)}
      </span>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-vivid-magenta transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const OrphanSpaceRow = ({
  space,
  onDelete
}: {
  space: SpaceWithApp;
  index: number;
  onDelete: (spaceId: string) => Promise<boolean>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(space.id);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all">
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 z-10"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delete Legacy Space?</span>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-[10px] font-black rounded-lg bg-white/5"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-[10px] font-black rounded-lg bg-red-600 text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Yes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-8 h-8 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-500 shrink-0">
        <Package size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-500 truncate font-light block">
          {space.name}
        </span>
      </div>

      <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
        #{space.id.slice(0, 6)}
      </span>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-vivid-magenta transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
