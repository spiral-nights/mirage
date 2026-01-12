import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Edit3, Trash2, XCircle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SpaceWithApp } from '../../types'; // We need to define this somewhere

export const SpaceRow = ({
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
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-gray-700 font-mono tracking-wider uppercase shrink-0 hidden md:block">
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
                <div className="flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => { setEditName(space.name); setIsEditing(true); }}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-white transition-all shrink-0 mr-1"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100 shrink-0"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};
