import { useState } from 'react';
import { X, Database, Plus, Play, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModalWrapper } from './ModalWrapper';
import { type Space } from '../hooks/useSpaces';
import { getAppCanonicalId } from '../lib/utils';

import { type AppDefinition } from '@mirage/core';

interface SpacePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppDefinition | null;
  onCreateNew: () => void;
  spaces: Space[];
  createSpace: (name: string, appId: string, offline?: boolean) => Promise<Space | null>;
}

export const SpacePickerModal = ({ isOpen, onClose, app, onCreateNew, spaces, createSpace }: SpacePickerModalProps) => {
  const navigate = useNavigate();
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);

  if (!app) return null;

  // Use canonical ID for matching to handle relay list changes in naddr
  const canonicalId = getAppCanonicalId(app.naddr);
  const appSpaces = spaces.filter(s => s.appOrigin === canonicalId);

  // Check if a "Default" space already exists for this app
  const defaultSpace = appSpaces.find(s => s.name === 'Default' || s.name === 'Default Space');

  const handleSelectSpace = (spaceId: string, spaceName: string) => {
    navigate(`/run/${app.naddr}?spaceId=${spaceId}&spaceName=${encodeURIComponent(spaceName)}`);
    onClose();
  };

  const handleUseDefaultSpace = async () => {
    if (defaultSpace) {
      // Use existing Default space
      handleSelectSpace(defaultSpace.id, defaultSpace.name);
      return;
    }

    // Create a new Default space
    setIsCreatingDefault(true);
    try {
      const space = await createSpace('Default Space', canonicalId);
      if (space) {
        navigate(`/run/${app.naddr}?spaceId=${space.id}&spaceName=Default`);
        onClose();
      }
    } catch (e) {
      console.error('Failed to create default space:', e);
    } finally {
      setIsCreatingDefault(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-10 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">
            Launch <span className="serif-italic px-1">{app.name}</span>
          </h2>
          <p className="text-gray-500 text-sm font-light italic">
            Choose a space to store your data.
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
                <div className="flex-1 truncate text-left">
                  <div className="font-bold text-sm truncate flex items-center gap-2">
                    <span className="truncate">{s.name}</span>
                    {s.offline && (
                      <span className="px-1.5 py-0.5 rounded bg-vivid-cyan/20 text-vivid-cyan text-[10px] font-bold uppercase tracking-wider">
                        Offline
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-50 truncate font-mono">#{s.id.slice(0, 8)}</div>
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
            onClick={handleUseDefaultSpace}
            disabled={isCreatingDefault}
            className="w-full py-4 rounded-2xl bg-vivid-cyan/10 text-vivid-cyan border border-vivid-cyan/20 hover:bg-vivid-cyan/20 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreatingDefault ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play size={14} />
                {defaultSpace ? 'Use Default Space' : 'Quick Start (Create Default)'}
              </>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
