import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Plus, Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '../hooks/useSpaces';

import { type AppDefinition } from '@mirage/core';

interface SpacePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppDefinition | null;
  onCreateNew: () => void;
}

export const SpacePickerModal = ({ isOpen, onClose, app, onCreateNew }: SpacePickerModalProps) => {
  const { spaces } = useSpaces();
  const navigate = useNavigate();

  if (!app) return null;

  const appSpaces = spaces.filter(s => s.appOrigin === app.naddr);

  const handleSelectSpace = (spaceId: string, spaceName: string) => {
    navigate(`/run/${app.naddr}?spaceId=${spaceId}&spaceName=${encodeURIComponent(spaceName)}`);
    onClose();
  };

  const handleRunStandalone = () => {
    navigate(`/run/${app.naddr}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-lg bg-[#050505]/95 border border-white/5 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            <div className="p-10 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">
                  Launch <span className="serif-italic px-1">{app.name}</span>
                </h2>
                <p className="text-gray-500 text-sm font-light italic">
                  Choose a space to access your data.
                </p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 pt-6 space-y-6">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                {appSpaces.length > 0 ? (
                  appSpaces.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSpace(s.id, s.name)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-vivid-cyan/30 hover:bg-vivid-cyan/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-gray-600 group-hover:text-vivid-cyan transition-colors">
                        <Database size={18} />
                      </div>
                      <div className="flex-1 truncate">
                        <div className="font-bold text-sm truncate">{s.name}</div>
                        <div className="text-[10px] opacity-50 font-mono">#{s.id.slice(0, 8)}</div>
                      </div>
                      <Play size={14} className="text-gray-700 group-hover:text-vivid-cyan opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))
                ) : (
                  <div className="p-10 border border-dashed border-white/5 rounded-2xl text-center flex flex-col items-center gap-3">
                    <Info size={24} className="text-gray-700" />
                    <p className="text-xs text-gray-600 italic">No existing spaces for this app.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onCreateNew}
                  className="w-full py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                >
                  <Plus size={16} />
                  Create New Space
                </button>

                <button
                  onClick={handleRunStandalone}
                  className="w-full py-4 rounded-2xl text-gray-500 hover:text-gray-300 transition-all text-xs font-bold"
                >
                  Run without Space (Standalone)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
