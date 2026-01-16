import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { useMirage } from '../hooks/useMirage';
import { useSpaces } from '../hooks/useSpaces';
import { getAppCanonicalId } from '../lib/utils';
import type { AppDefinition } from '@mirage/core';
import type { SpaceWithApp } from '../types';

import {
  LayoutGrid,
  Database
} from 'lucide-react';

import { PublishModal } from '../components/PublishModal';
import { SpacePickerModal } from '../components/SpacePickerModal';
import { CreateSpaceModal } from '../components/CreateSpaceModal';
import { MirageLoader } from '../components/MirageLoader';

// Extracted Components
import { AppCard } from '../components/MyApps/AppCard';
import { OrphanSpaceRow } from '../components/MyApps/OrphanSpaceRow';
import { ResolvedAppName } from '../components/MyApps/ResolvedAppName';

// External Spaces Section (Kept inline or extracted? It's small but has logic. Keeping inline for now, but using ResolvedAppName)
import { Play, Code2, Trash2 } from 'lucide-react';

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
    return <MirageLoader />;
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

  const handleLaunch = async (app: AppDefinition) => {
    // Check if spaces exist for this app
    const canonicalId = getAppCanonicalId(app.naddr);
    const mySpaces = appSpaces.get(canonicalId) || [];

    if (mySpaces.length === 0) {
      // Auto-create default space
      try {
        const isOffline = app.offline; // Use offline flag from app definition
        const space = await createSpace('Default Space', canonicalId, isOffline);
        if (space) {
          navigate(`/run/${app.naddr}?spaceId=${space.id}&spaceName=Default`);
          return;
        }
      } catch (e) {
        console.error("Failed to auto-create space", e);
        // Fallback to picker
      }
    }

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
              <AppCard
                key={app.naddr}
                app={app}
                index={i}
                spaces={appSpaces.get(getAppCanonicalId(app.naddr)) || []}
                onDeleteApp={deleteApp}
                onDeleteSpace={deleteSpace}
                onRenameSpace={renameSpace}
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
            <h2 className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Shared & Personal Spaces</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="bg-card/40 border border-white/5 rounded-[32px] md:rounded-[40px] p-4 md:p-6 backdrop-blur-sm">
            <div className="space-y-3">
              {externalSpaces.map((space) => (
                <div key={space.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${space.offline
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'bg-vivid-yellow/10 border border-vivid-yellow/20 text-vivid-yellow'
                      }`}>
                      <Database size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{space.name}</h3>
                        {space.offline ? (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 text-[9px] font-bold uppercase tracking-wider">
                            Offline
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-vivid-yellow/20 text-vivid-yellow text-[9px] font-bold uppercase tracking-wider">
                            Online
                          </span>
                        )}
                      </div>
                      {space.appOrigin && space.appOrigin !== 'mirage' ? (
                        <ResolvedAppName
                          naddr={space.appOrigin}
                          className="text-xs text-gray-500 font-mono"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 font-mono">Personal Space</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {space.appOrigin && space.appOrigin !== 'mirage' && (
                      <>
                        <button
                          onClick={() => handleLaunchExternalApp(space)}
                          className={`p-2 hover:bg-white/10 rounded-lg text-gray-500 transition-colors ${space.offline ? 'hover:text-orange-500' : 'hover:text-vivid-cyan'}`}
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
