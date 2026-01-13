import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Database,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Play,
    Trash2,
    Edit3,
    Code2
} from 'lucide-react';
import { nip19 } from 'nostr-tools';
import type { AppDefinition } from '@mirage/core';

import { cn } from '../../lib/utils';
import type { SpaceWithApp } from '../../types';
import { SpaceRow } from './SpaceRow';

interface AppCardProps {
    app: AppDefinition;
    index: number;
    spaces: SpaceWithApp[];
    onDeleteApp: (naddr: string) => Promise<boolean>;
    onDeleteSpace: (spaceId: string) => Promise<boolean>;
    onRenameSpace: (spaceId: string, name: string) => Promise<boolean>;
    onOpenSource: (app: AppDefinition, mode: 'edit' | 'view') => void;
    onLaunch: (app: AppDefinition) => void;
    pubkey: string | null;
}

export const AppCard = ({
    app,
    index,
    spaces,
    onDeleteApp,
    onDeleteSpace,
    onRenameSpace,
    onOpenSource,
    onLaunch,
    pubkey
}: AppCardProps) => {
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);
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
                            className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-t-[32px] flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:px-10 gap-4 z-20 border border-red-500/20"
                        >
                            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                                <AlertCircle size={22} className="text-red-500" />
                                <span className="text-base sm:text-lg font-medium text-center sm:text-left">Remove from library?</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors font-medium"
                                    disabled={isDeleting}
                                >
                                    Keep It
                                </button>
                                <button
                                    onClick={handleDeleteApp}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-bold"
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
