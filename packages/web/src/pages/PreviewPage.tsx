import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMirage } from '../hooks/useMirage';
import { useAppActions } from '../contexts/AppActionsContext';
import { PublishModal } from '../components/PublishModal';
import { XCircle, Edit3, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
// import { ModalWrapper } from '../components/ModalWrapper'; // Removed

interface PreviewState {
    code: string;
    mode: 'create' | 'edit';
    appName?: string;
    spaceRequirement?: never; // Deprecated - spaces are always required
    existingDTag?: string;
    returnTo?: string; // Path to return to on cancel (default: /create)
}

export const PreviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { host, publishApp } = useMirage();
    const { setAppActions } = useAppActions();
    const containerRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<'loading' | 'running' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Get preview data from navigation state
    const previewState = location.state as PreviewState | null;

    useEffect(() => {
        // If no preview state, redirect back to create page
        if (!previewState?.code) {
            navigate('/create');
            return;
        }

        // Skip if no host
        if (!host || !containerRef.current) return;

        let mounted = true;

        const loadApp = async () => {
            setStatus('loading');

            try {
                const { code } = previewState;

                // Mount the app in preview mode (no naddr, so no persistent storage)
                await host.mount(code, containerRef.current!, { appId: '__preview__' });

                if (!mounted) return;

                setStatus('running');
            } catch (err) {
                if (!mounted) return;
                console.error('Failed to run preview app:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setStatus('error');
            }
        };

        loadApp();

        return () => {
            mounted = false;
        };
    }, [previewState, host, navigate]);

    const handlePublish = async () => {
        if (!previewState) return;

        const { code, existingDTag } = previewState;
        const name = previewState.appName || 'Unnamed App';

        setIsPublishing(true);
        try {
            const naddr = await publishApp(code, name, existingDTag);

            // Navigate to the updated app
            navigate(`/run/${naddr}`);
        } catch (error) {
            console.error('Publishing failed:', error);
            alert('Publishing failed. Do you have a Nostr extension (NIP-07) installed?');
        } finally {
            setIsPublishing(false);
        }
    };



    const isEditMode = previewState?.mode === 'edit';

    // Update context for sidebar actions on mobile
    useEffect(() => {
        if (!previewState) return;

        const handleEditSource = () => {
            setIsEditModalOpen(true);
        };

        const handleCancel = () => {
            // Return to the original location, or /create as fallback
            navigate(previewState.returnTo || '/create');
        };

        setAppActions({
            app: { name: 'Preview Mode', naddr: '__preview__' } as any,
            isAuthor: true,
            onViewEditSource: handleEditSource,
            onInvite: null,
            onExit: handleCancel,
        });

        return () => {
            setAppActions({
                app: null,
                isAuthor: false,
                onViewEditSource: null,
                onInvite: null,
                onExit: null,
            });
        };
    }, [previewState?.code, navigate, setAppActions]);

    const handleEditSourceDesktop = () => {
        if (!previewState) return;
        setIsEditModalOpen(true);
    };

    const handleCancelDesktop = () => {
        // Return to the original location, or /create as fallback
        navigate(previewState?.returnTo || '/create');
    };

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-8">
                <XCircle size={64} className="text-red-500 mb-6" />
                <h1 className="text-3xl font-black mb-3 tracking-tight">Preview failure.</h1>
                <p className="text-gray-500 font-light italic mb-10 max-w-sm">{error}</p>
                <button
                    onClick={() => navigate('/create')}
                    className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-background overflow-hidden flex flex-col relative">
            {/* Desktop Header Toolbar */}
            <div className="hidden md:flex flex-none h-20 items-center justify-between px-8 bg-background border-b border-white/5 z-40 relative">
                {/* Left: Preview Badge */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-2 bg-vivid-cyan/10 border border-vivid-cyan/20 rounded-xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-vivid-cyan rounded-full animate-pulse" />
                        <span className="text-vivid-cyan text-xs font-black uppercase tracking-wider">Preview Mode</span>
                    </div>
                </motion.div>

                {/* Center: Actions */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                    <motion.button
                        onClick={handleEditSourceDesktop}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Source
                    </motion.button>

                    <motion.button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(
                            "px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2",
                            isPublishing
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-vivid-cyan text-black hover:bg-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        )}
                    >
                        <Save size={16} />
                        {isPublishing ? 'Publishing...' : isEditMode ? 'Update App' : 'Publish App'}
                    </motion.button>

                    <motion.button
                        onClick={handleCancelDesktop}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="px-6 py-3 bg-transparent border border-white/5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <XCircle size={16} />
                        Cancel
                    </motion.button>
                </div>
            </div>

            {/* App Container */}
            <div ref={containerRef} className="flex-1 w-full relative z-0" />

            {/* Loading Overlay */}
            {status === 'loading' && (
                <div className="absolute inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center p-12">
                    <div className="w-full max-w-3xl animate-pulse">
                        <div className="h-20 bg-white/5 rounded-3xl mb-12 w-1/4" />
                        <div className="space-y-6">
                            <div className="h-48 bg-white/5 rounded-[40px]" />
                            <div className="h-4 bg-white/5 rounded w-full" />
                            <div className="h-4 bg-white/5 rounded w-5/6 opacity-50" />
                        </div>
                        <div className="mt-16 grid grid-cols-3 gap-6">
                            <div className="h-32 bg-white/5 rounded-3xl" />
                            <div className="h-32 bg-white/5 rounded-3xl" />
                            <div className="h-32 bg-white/5 rounded-3xl" />
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col items-center">
                        <div className="w-12 h-12 border border-vivid-cyan/30 border-t-vivid-cyan rounded-full animate-spin mb-6" />
                        <p className="text-gray-600 text-[10px] tracking-[0.4em] uppercase font-black">Loading Preview...</p>
                    </div>
                </div>
            )}

            {/* Mobile Preview Badge */}
            <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-20">
                <div className="px-3 py-1.5 bg-vivid-cyan/10 border border-vivid-cyan/20 rounded-lg backdrop-blur-xl">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-vivid-cyan rounded-full animate-pulse" />
                        <span className="text-vivid-cyan text-[10px] font-black uppercase tracking-wider">Preview</span>
                    </div>
                </div>
            </div>

            {/* Edit Source Modal (shown in-place, no navigation) */}
            <PublishModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode={previewState?.mode || 'create'}
                initialCode={previewState?.code || ''}
                initialName={previewState?.appName || ''}
                existingDTag={previewState?.existingDTag}
            />
        </div>
    );
};
