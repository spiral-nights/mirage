import { useState, useEffect } from 'react';
import { X, Database, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { type Space } from '../hooks/useSpaces';
import { cn, getAppCanonicalId } from '../lib/utils';
import { ModalWrapper } from './ModalWrapper';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (spaceId: string) => void;
  initialAppId?: string; // Pre-select an app (e.g., when opened from SpacePickerModal)
  createSpace: (name: string, appId: string, offline?: boolean) => Promise<Space | null>;
}

export const CreateSpaceModal = ({ isOpen, onClose, onSuccess, initialAppId, createSpace }: CreateSpaceModalProps) => {
  const { apps } = useMirage();
  const [name, setName] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(initialAppId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [offline, setOffline] = useState(false);

  const navigate = useNavigate();

  // Sync selectedAppId when modal opens or initialAppId changes
  useEffect(() => {
    if (isOpen && initialAppId) {
      setSelectedAppId(initialAppId);
    }
  }, [isOpen, initialAppId]);

  const selectedApp = apps.find(a => a.naddr === selectedAppId);

  const handleCreate = async () => {
    if (!name.trim() || !selectedAppId) return;

    setIsCreating(true);
    try {
      // Use Canonical ID as the app origin to ensure spaces stick even if app naddr (relays) changes
      const canonicalId = getAppCanonicalId(selectedAppId);
      const space = await createSpace(name, canonicalId, offline);
      if (space) {
        onSuccess?.(space.id);
        navigate(`/run/${selectedAppId}?spaceId=${space.id}&spaceName=${encodeURIComponent(name)}`);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-xl">
      {/* Header */}
      {/* Header */}
      <div className="p-10 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">
            New <span className="serif-italic px-1">Space</span>
          </h2>
          <p className="text-gray-500 text-sm font-light italic">
            Create a dedicated data instance for an application.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <form
        className="p-10 pt-6 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        {/* Space Name */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-3">
            Space Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Personal Journal"
            autoFocus
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-vivid-yellow/30 focus:ring-4 focus:ring-vivid-yellow/5 outline-none transition-all font-medium"
          />
        </div>

        {/* App Selection - Only show if no app pre-selected */}
        {!initialAppId && (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-3">
              Select Application
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-none">
              {apps.length > 0 ? (
                apps.map((app) => (
                  <button
                    key={app.naddr}
                    type="button"
                    onClick={() => setSelectedAppId(app.naddr)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                      selectedAppId === app.naddr
                        ? "bg-vivid-magenta/10 border-vivid-magenta/30 text-white"
                        : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-all",
                      selectedAppId === app.naddr ? "bg-vivid-magenta/20 text-vivid-magenta" : "bg-black/40 text-gray-600 group-hover:text-gray-400"
                    )}>
                      {app.name.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-bold text-sm truncate">{app.name}</div>
                      <div className="text-[10px] opacity-50 truncate font-mono">#{app.naddr.slice(0, 12)}...</div>
                    </div>
                    {selectedAppId === app.naddr && (
                      <div className="w-6 h-6 rounded-full bg-vivid-magenta flex items-center justify-center text-white shadow-lg">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-10 border border-dashed border-white/5 rounded-2xl text-center text-xs text-gray-600 italic">
                  No applications found in library.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show selected app info if pre-selected */}
        {initialAppId && selectedApp && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-vivid-magenta/10 border border-vivid-magenta/20">
            <div className="w-10 h-10 rounded-xl bg-vivid-magenta/20 flex items-center justify-center text-lg font-bold text-vivid-magenta">
              {selectedApp.name.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">For Application</div>
              <div className="font-bold text-sm truncate text-white">{selectedApp.name}</div>
            </div>
          </div>
        )}

        {/* Offline Toggle */}
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <input
            type="checkbox"
            id="offline-toggle"
            checked={offline}
            onChange={(e) => setOffline(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/40 text-vivid-cyan focus:ring-vivid-cyan/50"
          />
          <label htmlFor="offline-toggle" className="flex-1 cursor-pointer select-none">
            <div className="text-sm font-bold text-white mb-1">Offline Space</div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Data is stored <span className="text-vivid-cyan font-bold">locally only</span> and never leaves this device.
              Good for privacy, but means you cannot invite others or access from other devices.
            </p>
          </label>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            type="submit"
            disabled={isCreating || !name.trim() || !selectedAppId}
            className={cn(
              "flex-1 py-4 rounded-2xl font-black transition-all relative overflow-hidden text-sm uppercase tracking-widest flex items-center justify-center gap-3",
              isCreating || !name.trim() || !selectedAppId
                ? "bg-white/5 text-gray-600 cursor-not-allowed"
                : "bg-vivid-cyan text-[#050505] shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
            ) : (
              <>
                <Database size={18} />
                Create & Launch
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
