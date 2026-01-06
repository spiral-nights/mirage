import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useMirage } from '../hooks/useMirage';
import { cn, getAppCanonicalId } from '../lib/utils';
import {
  LayoutGrid,
  Play,
  Trash2,
  AlertCircle,
  Database,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Package,
  Code2,
  Edit3,
  Check,
  XCircle
} from 'lucide-react';
import { type AppDefinition } from '@mirage/core';
import { PublishModal } from '../components/PublishModal';
import { SpacePickerModal } from '../components/SpacePickerModal';
import { CreateSpaceModal } from '../components/CreateSpaceModal';
import { nip19 } from 'nostr-tools';
import { useSpaces } from '../hooks/useSpaces';

interface SpaceWithApp {
  id: string;
  name: string;
  createdAt: number;
  appOrigin?: string;
}



const ResolvedAppName = ({ naddr, className }: { naddr: string; className?: string }) => {
  const { host, apps } = useMirage();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      // 1. Check verified apps first
      const existing = apps.find(a => getAppCanonicalId(a.naddr) === getAppCanonicalId(naddr));
      if (existing) {
        if (mounted) setName(existing.name);
        return;
      }

      // 2. Fetch from network
      try {
        if (host) {
          console.log(`[AppName] Fetching for ${naddr}...`);

          let fetchNaddr = naddr;
          // Convert colon-separated coordinate to naddr if needed
          if (naddr.includes(':')) {
            try {
              const parts = naddr.split(':');
              if (parts.length >= 3) {
                const kind = parseInt(parts[0]);
                const pubkey = parts[1];
                const identifier = parts.slice(2).join(':');
                fetchNaddr = nip19.naddrEncode({ kind, pubkey, identifier });
                console.log(`[AppName] Converted ${naddr} to ${fetchNaddr}`);
              }
            } catch (err) {
              console.warn("[AppName] Failed to convert coordinate to naddr", err);
            }
          }

          const code = await host.fetchApp(fetchNaddr);
          console.log(`[AppName] Fetch result length: ${code?.length}`);
          if (code && mounted) {
            const match = code.match(/<title>(.*?)<\/title>/i);
            console.log(`[AppName] Match:`, match);
            if (match && match[1]) {
              setName(match[1].trim());
            } else {
              console.warn(`[AppName] No title tag found in code.`);
            }
          }
        }
      } catch (e) {
        console.error(`[AppName] Fetch error:`, e);
        // ignore
      }
    };
    resolve();
    return () => { mounted = false; };
  }, [naddr, host, apps]);

  if (name) return <span className={className}>{name}</span>;
  return <span className={className}>App: {naddr.slice(0, 12)}...{naddr.slice(-4)}</span>;
};

export const MyAppsPage = () => {
  const navigate = useNavigate();
  const { apps, isReady, deleteApp, fetchApp, pubkey } = useMirage();
  const { spaces, deleteSpace, renameSpace, createSpace } = useSpaces();

  // Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);

  const [modalProps, setModalProps] = useState<{
    mode: 'edit' | 'view';
    initialName: string;
    initialCode: string;
    existingDTag?: string;
    authorPubkey?: string;
  }>({ mode: 'view', initialName: '', initialCode: '' });

  // Group spaces by their parent app using canonical ID
  const appSpaces = useMemo(() => {
    const map = new Map<string, SpaceWithApp[]>();
    spaces.forEach(space => {
      if (space.appOrigin) {
        const id = getAppCanonicalId(space.appOrigin);
        if (!map.has(id)) map.set(id, []);
        map.get(id)!.push(space);
      }
    });
    return map;
  }, [spaces]);

  const externalSpaces = useMemo(() => {
    const appIds = new Set(apps.map(a => getAppCanonicalId(a.naddr)));
    return spaces.filter(s => {
      if (!s.appOrigin) return false;
      return !appIds.has(getAppCanonicalId(s.appOrigin));
    });
  }, [spaces, apps]);

  const orphanSpaces = useMemo(() => {
    return spaces.filter(s => !s.appOrigin);
  }, [spaces]);

  // Loading state
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-8">
        <div className="w-12 h-12 border-2 border-vivid-cyan/30 border-t-vivid-cyan rounded-full animate-spin" />
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-black animate-pulse">Synchronizing...</p>
      </div>
    );
  }

  const handleOpenSource = async (app: AppDefinition, mode: 'edit' | 'view') => {
    try {
      // 1. Fetch the source code
      const code = await fetchApp(app.naddr);
      if (!code) throw new Error("Could not fetch app source");

      // 2. Extract dTag from naddr
      const { data } = nip19.decode(app.naddr) as { data: { identifier: string; pubkey: string } };

      // 3. Open modal
      setModalProps({
        mode,
        initialName: app.name,
        initialCode: code,
        existingDTag: data.identifier,
        authorPubkey: data.pubkey
      });
      setPublishModalOpen(true);
    } catch (e) {
      console.error("Failed to open source:", e);
      alert("Failed to load application source from relays.");
    }
  };

  const handleLaunchExternalApp = (space: SpaceWithApp) => {
    const naddr = space.appOrigin!;
    console.log("Launching external app:", naddr);
    let target = naddr;
    if (naddr.includes(':')) {
      try {
        const parts = naddr.split(':');
        if (parts.length >= 3) {
          const kind = parseInt(parts[0]);
          const pubkey = parts[1];
          const identifier = parts.slice(2).join(':');
          target = nip19.naddrEncode({ kind, pubkey, identifier });
        }
      } catch (e) {
        console.error("Failed to encode naddr", e);
      }
    }
    navigate(`/run/${target}?spaceId=${space.id}&spaceName=${encodeURIComponent(space.name)}`);
  };

  const handleLaunchExternalSource = async (space: SpaceWithApp) => {
    const naddr = space.appOrigin!;
    let target = naddr;
    // 1. Convert to naddr if needed
    if (naddr.includes(':')) {
      try {
        const parts = naddr.split(':');
        if (parts.length >= 3) {
          const kind = parseInt(parts[0]);
          const pubkey = parts[1];
          const identifier = parts.slice(2).join(':');
          target = nip19.naddrEncode({ kind, pubkey, identifier });
        }
      } catch (e) {
        console.error("Failed to encode naddr", e);
      }
    }

    try {
      const code = await fetchApp(target);
      if (!code) throw new Error("Could not fetch app source");

      const { data } = nip19.decode(target) as { data: { identifier: string; pubkey: string } };

      setModalProps({
        mode: 'view',
        initialName: space.name || 'External App',
        initialCode: code,
        existingDTag: data.identifier,
        authorPubkey: data.pubkey
      });
      setPublishModalOpen(true);
    } catch (e) {
      console.error("Failed to fetch external app source:", e);
      alert("Failed to load application source.");
    }
  };

  const handleLaunch = (app: AppDefinition) => {
    setSelectedApp(app);
    setPickerModalOpen(true);
  };

  return (
    <div className="max-w-5xl">
      <header className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tighter">
          Your <span className="text-transparent bg-clip-text bg-brand-gradient pr-2">Library</span>
        </h1>
        <p className="text-gray-500 text-base md:text-xl font-light max-w-2xl leading-relaxed">
          Your personal collection of decentralized apps and their private data spaces.
        </p>
      </header>

      {/* Main Apps Section */}
      <section className="mb-12 md:mb-20">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-vivid-magenta">
            <LayoutGrid size={18} />
          </div>
          <h2 className="text-[10px] md:text-sm font-black text-gray-700 uppercase tracking-[0.2em] md:tracking-[0.3em]">Active Applications</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {apps.length > 0 ? (
            apps.map((app, i) => (
              <AppWithSpaces
                key={app.naddr}
                app={app}
                index={i}
                spaces={appSpaces.get(getAppCanonicalId(app.naddr)) || []}
                onDeleteApp={deleteApp}
                onDeleteSpace={deleteSpace}
                onRenameSpace={renameSpace} // Added
                onOpenSource={handleOpenSource}
                onLaunch={handleLaunch}
                pubkey={pubkey}
              />
            ))
          ) : (
            <div className="p-12 md:p-20 text-center bg-surface border border-white/5 rounded-[32px] md:rounded-[48px]">
              <p className="text-lg md:text-xl text-gray-600 font-light">No apps in your library. Start by creating one from the home screen.</p>
            </div>
          )}
        </div>
      </section>

      {/* External/Shared Spaces Section */}
      {externalSpaces.length > 0 && (
        <section className="mb-12 md:mb-20">
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-vivid-cyan/10 flex items-center justify-center text-vivid-cyan">
              <Database size={18} />
            </div>
            <h2 className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Shared Spaces (Other Apps)</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="bg-card/40 border border-white/5 rounded-[32px] md:rounded-[40px] p-4 md:p-6 backdrop-blur-sm">
            <div className="space-y-3">
              {externalSpaces.map((space) => (
                <div key={space.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-vivid-cyan/20 flex items-center justify-center text-vivid-cyan">
                      <Database size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{space.name}</h3>
                      {space.appOrigin && (
                        <ResolvedAppName
                          naddr={space.appOrigin}
                          className="text-xs text-gray-500 font-mono"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {space.appOrigin && (
                      <>
                        <button
                          onClick={() => handleLaunchExternalApp(space)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-vivid-cyan transition-colors"
                          title="Launch App"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleLaunchExternalSource(space)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="View App Info"
                        >
                          <Code2 size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteSpace(space.id)}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete Space"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Legacy/Orphan Spaces Section */}
      {orphanSpaces.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-vivid-cyan/10 flex items-center justify-center text-vivid-cyan">
              <Database size={18} />
            </div>
            <h2 className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Legacy Data Spaces</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="bg-card/40 border border-white/5 rounded-[32px] md:rounded-[40px] p-4 md:p-6 backdrop-blur-sm">
            <div className="space-y-3">
              {orphanSpaces.map((space, i) => (
                <OrphanSpaceRow key={space.id} space={space} index={i} onDelete={deleteSpace} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modals */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        returnTo="/"
        {...modalProps}
      />

      <SpacePickerModal
        isOpen={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        app={selectedApp}
        onCreateNew={() => {
          setPickerModalOpen(false);
          setCreateSpaceOpen(true);
        }}
        spaces={spaces}
        createSpace={createSpace}
      />

      <CreateSpaceModal
        isOpen={createSpaceOpen}
        onClose={() => setCreateSpaceOpen(false)}
        initialAppId={selectedApp?.naddr}
        createSpace={createSpace}
      />
    </div>
  );
};

const AppWithSpaces = ({
  app,
  index,
  spaces,
  onDeleteApp,
  onDeleteSpace,
  onRenameSpace,
  onOpenSource,
  onLaunch,
  pubkey
}: {
  app: AppDefinition;
  index: number;
  spaces: SpaceWithApp[];
  onDeleteApp: (naddr: string) => Promise<boolean>;
  onDeleteSpace: (spaceId: string) => Promise<boolean>;
  onRenameSpace: (spaceId: string, name: string) => Promise<boolean>;
  onOpenSource: (app: AppDefinition, mode: 'edit' | 'view') => void;
  onLaunch: (app: AppDefinition) => void;
  pubkey: string | null;
}) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(spaces.length > 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteApp = async () => {
    setIsDeleting(true);
    await onDeleteApp(app.naddr);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  const handleLaunchSpace = (space: SpaceWithApp) => {
    navigate(`/run/${app.naddr}?spaceId=${space.id}&spaceName=${encodeURIComponent(space.name)}`);
  };

  const isAuthor = useMemo(() => {
    try {
      const decoded = nip19.decode(app.naddr) as { data: { pubkey: string } };
      return decoded.data.pubkey === pubkey;
    } catch (e) {
      return false;
    }
  }, [app.naddr, pubkey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: "easeOut" }}
      className="bg-surface border border-white/5 rounded-[32px] overflow-hidden group/card hover:border-white/10 hover:bg-white/[0.02] transition-all duration-500 shadow-xl hover:shadow-2xl"
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
              className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-t-[32px] flex items-center justify-between px-10 z-20 border border-red-500/20"
            >
              <div className="flex items-center gap-4">
                <AlertCircle size={22} className="text-red-500" />
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
                  className="px-6 py-2.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 font-bold"
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

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h3 className="text-xl md:text-2xl font-black truncate transition-colors duration-500">
                {app.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[8px] md:text-[10px] text-vivid-yellow bg-vivid-yellow/10 border border-vivid-yellow/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase font-black tracking-widest">
                  <Sparkles size={8} fill="currentColor" className="md:w-[10px] md:h-[10px]" />
                  Verified
                </span>
                {spaces.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[8px] md:text-[10px] text-vivid-cyan bg-vivid-cyan/10 border border-vivid-cyan/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase font-black tracking-widest">
                    <Database size={8} className="md:w-[10px] md:h-[10px]" />
                    {spaces.length} Spaces
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-700 font-light">
              Added {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-4 md:mt-0">
            <div className="flex items-center bg-white/5 rounded-2xl p-0.5 md:p-1 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => onOpenSource(app, isAuthor ? 'edit' : 'view')}
                title={isAuthor ? "Edit Source" : "View App Info"}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                {isAuthor ? <Edit3 size={18} /> : <Code2 size={18} />}
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                title="Remove App"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onLaunch(app)}
                className="h-10 md:h-11 px-4 md:px-6 rounded-2xl bg-white text-black hover:bg-vivid-cyan hover:text-black transition-all flex items-center gap-3 font-black text-xs md:text-sm active:scale-95 translate-y-0 hover:-translate-y-0.5"
              >
                <Play size={14} className="md:w-4 md:h-4" fill="currentColor" />
                Launch
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700 hover:bg-white/10 transition-all",
                  isExpanded && "bg-white/10 text-white"
                )}
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
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
                <div className="space-y-2.5 p-4 bg-background/50 rounded-[24px] border border-white/5">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                    <Database size={12} className="text-vivid-yellow" />
                    App Spaces
                  </p>
                  {spaces.map((space, i) => (
                    <SpaceRow
                      key={space.id}
                      space={space}
                      index={i}
                      onDelete={onDeleteSpace}
                      onRename={onRenameSpace}
                      onLaunch={() => handleLaunchSpace(space)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-background/50 rounded-[24px] border border-dashed border-white/5">
                  <p className="text-sm text-gray-700 font-light">
                    No data spaces detected for this integration.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  );
};


const SpaceRow = ({
  space,
  onDelete,
  onRename,
  onLaunch
}: {
  space: SpaceWithApp;
  index: number;
  onDelete: (spaceId: string) => Promise<boolean>;
  onRename: (spaceId: string, name: string) => Promise<boolean>;
  onLaunch: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(space.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(space.id);
    setIsDeleting(false);
    setShowConfirm(false);
  };

  const handleSave = async () => {
    if (!editName.trim() || editName === space.name) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await onRename(space.id, editName);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(space.name);
      setIsEditing(false);
    }
  };

  const isUnnamed = !space.name || space.name.startsWith('Space ');

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute inset-0 bg-background/98 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 z-10 border border-red-500/20 shadow-xl"
          >
            <span className="text-xs font-bold text-gray-500">Permanently delete space?</span>
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
                className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-red-600 text-white flex items-center gap-2"
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

      <div
        onClick={!isEditing ? onLaunch : undefined}
        className={cn(
          "w-8 h-8 rounded-xl bg-vivid-yellow/10 border border-vivid-yellow/20 flex items-center justify-center text-vivid-yellow shrink-0 transition-transform group-hover:scale-110",
          !isEditing && "cursor-pointer hover:bg-vivid-yellow/20"
        )}
      >
        <Database size={14} />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-vivid-yellow/50"
            />
          </div>
        ) : (
          <span className={cn(
            "text-sm font-semibold transition-colors group-hover:text-vivid-yellow truncate block cursor-pointer",
            isUnnamed ? 'text-gray-700 italic font-light' : 'text-gray-300'
          )} onClick={onLaunch}>
            {space.name}
          </span>
        )}
      </div>

      {!isEditing && (
        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-gray-700 font-mono tracking-wider uppercase">
          #{space.id.slice(0, 6)}
        </span>
      )}

      {isEditing ? (
        <div className="flex items-center gap-1">
          <button onClick={() => setIsEditing(false)} disabled={isSaving} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 disabled:opacity-50">
            <XCircle size={14} />
          </button>
          <button onClick={handleSave} disabled={isSaving} className="p-1.5 rounded-lg hover:bg-vivid-yellow/20 text-vivid-yellow disabled:opacity-50">
            {isSaving ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
          </button>
        </div>
      ) : (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setEditName(space.name); setIsEditing(true); }}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-white transition-all shrink-0 mr-1"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
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
            className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 z-10 border border-red-500/20"
          >
            <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Delete Legacy Space?</span>
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

      <div className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center text-gray-700 shrink-0">
        <Package size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 truncate font-light block">
          {space.name}
        </span>
      </div>

      <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
        #{space.id.slice(0, 6)}
      </span>

      <button
        onClick={() => setShowConfirm(true)}
        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
