import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpaceWithApp } from '../../types';

export const OrphanSpaceRow = ({
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
        <div className="group relative isolate overflow-hidden flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all">
            {/* Delete Confirmation */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black rounded-2xl flex items-center justify-between px-4 sm:px-6 z-10 border border-red-500/20"
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
            <div className="flex-1">
                <span className="text-gray-400 font-mono text-xs">{space.id}</span>
                {space.name && <span className="ml-2 text-gray-500">({space.name})</span>}
            </div>
            <button
                onClick={() => setShowConfirm(true)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
                <span className="sr-only">Delete</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
        </div>
    );
};
