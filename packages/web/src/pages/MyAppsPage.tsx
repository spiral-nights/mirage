import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { LayoutGrid, Play } from 'lucide-react';

export const MyAppsPage = () => {
  const { apps } = useMirage();

  return (
    <div className="max-w-6xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">My Apps</h1>
        <p className="text-gray-400 text-lg">Your collection of Mirage applications.</p>
      </header>

      {apps.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#2E2E36] rounded-3xl">
          <LayoutGrid className="mx-auto mb-4 text-gray-600" size={48} />
          <h2 className="text-xl font-bold mb-2">No apps yet</h2>
          <p className="text-gray-500 mb-6">Create your first app from the Home screen.</p>
          <Link 
            to="/"
            className="inline-block bg-[#1A1A22] border border-[#2E2E36] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2E2E36] transition-colors"
          >
            Go to Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, i) => (
            <motion.div
              key={app.naddr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
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
          ))}
        </div>
      )}
    </div>
  );
};
