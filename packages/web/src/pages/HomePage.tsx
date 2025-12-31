import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PublishModal } from '../components/PublishModal';
import { useMirage } from '../hooks/useMirage';
import { generateSystemPrompt } from '../lib/system-prompt';
import { cn } from '../lib/utils';

export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useMirage();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Modal props from preview navigation
  const [modalProps, setModalProps] = useState<{
    mode: 'create' | 'edit';
    initialCode: string;
    initialName?: string;
    existingDTag?: string;
    returnTo?: string;
    returnState?: any;
  }>({ mode: 'create', initialCode: '' });

  // Handle return from preview with code to edit
  useEffect(() => {
    const state = location.state as any;
    if (state?.openModal) {
      setModalProps({
        mode: state.mode || 'create',
        initialCode: state.code || '',
        initialName: state.appName || '',
        existingDTag: state.existingDTag,
        returnTo: state.returnTo,
        returnState: state.returnState,
      });
      setIsPublishOpen(true);

      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const copyPrompt = () => {
    const fullPrompt = generateSystemPrompt(promptInput || "A simple app");
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <header className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl pt-12 md:pt-20"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-8 md:mb-12 tracking-tighter leading-[0.9]">
            Build something <br />
            <span className="text-transparent bg-clip-text bg-brand-gradient pr-4">magic.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-500 font-light mb-12 md:mb-20 max-w-2xl leading-relaxed">
            The decentralized platform for building, running, and sharing cluster applications. No servers, just pure protocol.
          </p>

          <button
            onClick={() => setIsPublishOpen(true)}
            className="px-10 py-5 bg-white text-black rounded-[24px] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-20 md:mb-32 shadow-2xl hover:shadow-vivid-cyan/20"
          >
            <Plus size={20} />
            Publish App
          </button>
        </motion.div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="relative bg-surface border border-white/5 rounded-[40px] p-12 overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-black text-gray-700 uppercase tracking-[0.3em]">Ignition Sequence</h2>
          </div>

          <div className="mb-10">
            <label className="block text-xl font-medium text-white mb-6">
              What do you want to bring to life?
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. A decentralized chess board for global tournaments..."
              className="w-full bg-background border border-white/5 rounded-3xl p-6 text-xl text-white placeholder:text-gray-800 focus:border-vivid-cyan/30 focus:ring-4 focus:ring-vivid-cyan/5 outline-none transition-all resize-none h-40 font-light"
            />
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={copyPrompt}
              className={cn(
                "flex items-center gap-3 px-10 py-5 rounded-[24px] font-black transition-all transform active:scale-95 shadow-2xl",
                copied
                  ? "bg-vivid-teal text-black"
                  : "bg-white text-black hover:bg-vivid-cyan hover:text-white"
              )}
            >
              {copied ? <Check size={22} /> : <Copy size={22} />}
              {copied ? "COPIED" : "GENERATE PROTOCOL"}
            </button>

            <p className="text-gray-700 max-w-xs leading-relaxed italic text-sm font-light">
              Paste this blueprint into your favorite AI model to generate the application source.
            </p>
          </div>
        </div>
      </motion.div>



      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => {
          const { returnTo, returnState } = modalProps;
          setIsPublishOpen(false);
          // Reset modal props when closing
          setModalProps({ mode: 'create', initialCode: '' });

          // If we came from preview, return to preview with the state
          if (returnTo === '/preview' && returnState) {
            navigate('/preview', { state: returnState });
          }
        }}
        mode={modalProps.mode}
        initialCode={modalProps.initialCode}
        initialName={modalProps.initialName}
        existingDTag={modalProps.existingDTag}
      />
    </div>
  );
};
