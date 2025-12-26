import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { LayoutGrid, Play, Trash2, AlertCircle } from 'lucide-react';
import { type AppDefinition } from '@mirage/core';

export const MyAppsPage = () => {
  const { apps, spaces, isReady, deleteApp, deleteSpace } = useMirage();

  // Loading state
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12">
        {/* Shimmering Skeleton */}
        <div className="w-full max-w-4xl animate-pulse">
          <div className="h-12 bg-white/5 rounded-2xl mb-8 w-1/3" />
          <div className="h-6 bg-white/5 rounded w-2/3 mb-12" />

          <div className="h-8 bg-white/5 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="h-40 bg-white/5 rounded-2xl" />
            <div className="h-40 bg-white/5 rounded-2xl" />
            <div className="h-40 bg-white/5 rounded-2xl" />
          </div>

          <div className="h-8 bg-white/5 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-white/5 rounded-2xl" />
            <div className="h-40 bg-white/5 rounded-2xl" />
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
    <div className="max-w-6xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">My Library</h1>
        <p className="text-gray-400 text-lg">Your collection of apps and collaborative spaces.</p>
      </header>

      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/80">
          <LayoutGrid size={20} className="text-accent-primary" />
          Authored Apps
          <span className="text-sm font-normal text-gray-500 ml-2">({apps.length})</span>
        </h2>
        {apps.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2E2E36] rounded-3xl">
            <p className="text-gray-500">No authored apps yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, i) => (
              <AppCard key={app.naddr} app={app} index={i} onDelete={deleteApp} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/80">
          <Play size={20} className="text-accent-primary" />
          Joined Spaces
          <span className="text-sm font-normal text-gray-500 ml-2">({spaces.length})</span>
        </h2>
        {spaces.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2E2E36] rounded-3xl">
            <p className="text-gray-500">No joined spaces yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space, i) => (
              <SpaceCard key={space.id} space={space} index={i} onDelete={deleteSpace} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const AppCard = ({ app, index, onDelete }: { app: AppDefinition, index: number, onDelete: (naddr: string) => Promise<boolean> }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(app.naddr);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-[#1A1A22] border border-[#2E2E36] rounded-2xl p-6 hover:border-accent-primary/50 transition-all"
    >
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center p-4 z-10">
          <AlertCircle size={32} className="text-red-500 mb-3" />
          <p className="text-sm text-center mb-4">Delete this app from your library?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
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
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center text-xl">
          🚀
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
          <Link
            to={`/run/${app.naddr}`}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-primary hover:text-white transition-colors"
          >
            <Play size={16} fill="currentColor" />
          </Link>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-1 group-hover:text-accent-primary transition-colors">
        {app.name}
      </h3>
      <p className="text-xs text-gray-500 font-mono mb-4 truncate">
        {app.naddr}
      </p>

      <div className="text-xs text-gray-400">
        Created {new Date(app.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

const SpaceCard = ({ space, index, onDelete }: { space: any, index: number, onDelete: (spaceId: string) => Promise<boolean> }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(space.id);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-[#1A1A22] border border-[#2E2E36] rounded-2xl p-6 hover:border-accent-primary/50 transition-all"
    >
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center p-4 z-10">
          <AlertCircle size={32} className="text-red-500 mb-3" />
          <p className="text-sm text-center mb-4">Delete this space? You will lose access to its data.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
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
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-900 to-black rounded-xl flex items-center justify-center text-xl">
          🤝
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-600 cursor-not-allowed">
            <Play size={16} fill="currentColor" />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-1 group-hover:text-accent-primary transition-colors">
        {space.name}
      </h3>
      <p className="text-xs text-gray-500 font-mono mb-4 truncate">
        ID: {space.id}
      </p>

      <div className="text-xs text-gray-400 italic">
        Shared Space
      </div>
    </motion.div>
  );
};
