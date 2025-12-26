import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { LayoutGrid, Play } from 'lucide-react';
import { type AppDefinition } from '@mirage/core';

export const MyAppsPage = () => {
  const { apps, spaces } = useMirage();

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
        </h2>
        {apps.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2E2E36] rounded-3xl">
            <p className="text-gray-500">No authored apps yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, i) => (
              <AppCard key={app.naddr} app={app} index={i} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white/80">
          <Play size={20} className="text-accent-primary" />
          Joined Spaces
        </h2>
        {spaces.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2E2E36] rounded-3xl">
            <p className="text-gray-500">No joined spaces yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space, i) => (
              <SpaceCard key={space.id} space={space} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const AppCard = ({ app, index }: { app: AppDefinition, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#1A1A22] border border-[#2E2E36] rounded-2xl p-6 hover:border-accent-primary/50 transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center text-xl">
        🚀
      </div>
      <Link
        to={`/run/${app.naddr}`}
        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-primary hover:text-white transition-colors"
      >
        <Play size={16} fill="currentColor" />
      </Link>
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

const SpaceCard = ({ space, index }: { space: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#1A1A22] border border-[#2E2E36] rounded-2xl p-6 hover:border-accent-primary/50 transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-900 to-black rounded-xl flex items-center justify-center text-xl">
        🤝
      </div>
      {/* Since we don't have an naddr for joined spaces yet, we might need one or a direct link */}
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-600 cursor-not-allowed">
        <Play size={16} fill="currentColor" />
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
