import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import {
  LayoutGrid,
  Play,
  Trash2,
  AlertCircle,
  Star,
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
      if (!space.appOrigin || space.appOrigin === 'mirage-app') {
        orphans.push(space);
      } else {
        const existing = appSpaceMap.get(space.appOrigin) || [];
        existing.push(space);
        appSpaceMap.set(space.appOrigin, existing);
      }
    }

    return { appSpaces: appSpaceMap, orphanSpaces: orphans };
  }, [spaces]);

  // Loading state
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
        <div className="w-full max-w-4xl animate-pulse">
          <div className="h-12 bg-white/5 rounded-2xl mb-8 w-1/3" />
          <div className="h-6 bg-white/5 rounded w-2/3 mb-12" />

          <div className="grid grid-cols-1 gap-4 mb-16">
            <div className="h-28 bg-white/5 rounded-2xl" />
            <div className="h-28 bg-white/5 rounded-2xl" />
            <div className="h-28 bg-white/5 rounded-2xl" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-[10px] tracking-widest uppercase font-bold">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">My Library</h1>
        <p className="text-gray-400 text-lg">Your apps and their associated data spaces.</p>
      </header>

      {/* Apps with their spaces */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white/80">
            <LayoutGrid size={20} className="text-accent-primary" />
            My Apps
            <span className="text-sm font-normal text-gray-500 ml-2">({apps.length})</span>
          </h2>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2E2E36] rounded-3xl">
            <Sparkles size={32} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No apps in your library yet.</p>
            <p className="text-gray-600 text-sm">Create your first app from the home page!</p>
          </div>
        ) : (
          <div className="space-y-4">
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
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white/80">
              <Package size={20} className="text-gray-500" />
              Legacy Spaces
              <span className="text-sm font-normal text-gray-500 ml-2">({orphanSpaces.length})</span>
            </h2>
          </div>

          <p className="text-gray-500 text-sm mb-4">
            These spaces were created before app-specific storage was enabled. They are not associated with any specific app.
          </p>

          <div className="space-y-2 bg-[#16161A] border border-[#25252A] rounded-xl p-4">
            {orphanSpaces.map((space, i) => (
              <OrphanSpaceRow key={space.id} space={space} index={i} onDelete={deleteSpace} />
            ))}
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#1A1A22] border border-[#2E2E36] rounded-xl overflow-hidden"
    >
      {/* App Header */}
      <div className="group p-4 relative">
        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 rounded-t-xl flex items-center justify-between px-6 z-10"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-sm">Remove app from library?</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApp}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors shrink-0"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center text-xl shrink-0">
            🚀
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold truncate group-hover:text-accent-primary transition-colors">
                {app.name}
              </h3>
              <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                <Star size={10} fill="currentColor" />
                Author
              </span>
              {spaces.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full shrink-0">
                  <Database size={10} />
                  {spaces.length} space{spaces.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              Created {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirm(true)}
              className="h-9 px-3 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>

            <Link
              to={`/run/${app.naddr}`}
              className="h-9 px-4 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white transition-all flex items-center gap-2 font-medium text-sm"
            >
              <Play size={14} fill="currentColor" />
              Run App
            </Link>
          </div>
        </div>
      </div>

      {/* Spaces Section */}
      <AnimatePresence>
        {isExpanded && spaces.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#2E2E36] bg-[#16161A] px-4 py-3">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <Database size={12} />
                Data Spaces for this app
              </p>
              <div className="space-y-2">
                {spaces.map((space, i) => (
                  <SpaceRow key={space.id} space={space} index={i} onDelete={onDeleteSpace} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {isExpanded && spaces.length === 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#2E2E36] bg-[#16161A] px-4 py-4">
              <p className="text-xs text-gray-500 text-center">
                No data spaces yet. Spaces will appear here when the app stores data.
              </p>
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
    <div className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 rounded-lg flex items-center justify-between px-3 z-10"
          >
            <span className="text-xs text-gray-400">Delete this space?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 flex items-center gap-1"
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

      <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-900/50 to-black flex items-center justify-center text-xs shrink-0">
        🗄️
      </div>

      <div className="flex-1 min-w-0">
        <span className={`text-sm truncate ${isUnnamed ? 'text-gray-400' : ''}`}>
          {space.name}
        </span>
      </div>

      <span className="text-xs text-gray-600 font-mono">
        {space.id.slice(0, 8)}...
      </span>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={12} />
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
    <div className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 rounded-lg flex items-center justify-between px-3 z-10"
          >
            <span className="text-xs text-gray-400">Delete this space?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 flex items-center gap-1"
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

      <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-xs shrink-0">
        📦
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-400 truncate">
          {space.name}
        </span>
      </div>

      <span className="text-xs text-gray-600 font-mono">
        {space.id.slice(0, 8)}...
      </span>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};
