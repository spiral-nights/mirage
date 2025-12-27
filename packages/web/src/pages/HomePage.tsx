import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PublishModal } from '../components/PublishModal';
import { useMirage } from '../hooks/useMirage';
import { generateSystemPrompt } from '../lib/system-prompt';
import { cn } from '../lib/utils';

export const HomePage = () => {
  const navigate = useNavigate();
  useMirage();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [copied, setCopied] = useState(false);

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
          <h1 className="text-5xl md:text-8xl font-black mb-8 md:mb-12 tracking-tighter leading-[0.9]">
            Build something <br />
            <span className="serif-italic pr-4 text-vivid-cyan">magic.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-500 font-light italic mb-12 md:mb-20 max-w-2xl leading-relaxed">
            The decentralized platform for building, running, and sharing cluster applications. No servers, just pure protocol.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mb-20 md:mb-32">
            <button
              onClick={() => setIsPublishOpen(true)} // Assuming setIsModalOpen should be setIsPublishOpen
              className="px-10 py-5 bg-vivid-magenta text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-vivid-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Plus size={20} /> {/* Assuming PlusCircle should be Plus from lucide-react */}
              Publish App
            </button>

            <button
              onClick={() => navigate('/create')}
              className="px-10 py-5 bg-vivid-teal/10 text-vivid-teal border border-vivid-teal/20 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-vivid-teal/20 transition-all flex items-center justify-center gap-3"
            >
              <Zap size={20} fill="currentColor" />
              Connect Space
            </button>
          </div>
        </motion.div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-vivid-rainbow rounded-[44px] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-card/40 border border-white/5 rounded-[40px] p-12 overflow-hidden backdrop-blur-xl group-hover:border-white/10 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-vivid-rainbow opacity-30" />

          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Ignition Sequence</h2>
          </div>

          <div className="mb-10">
            <label className="block text-xl font-medium text-white mb-6">
              What do you want to bring to life?
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. A decentralized chess board for global tournaments..."
              className="w-full bg-background/50 border border-white/5 rounded-3xl p-6 text-xl text-white placeholder:text-gray-700 focus:border-vivid-cyan/30 focus:ring-4 focus:ring-vivid-cyan/5 outline-none transition-all resize-none h-40 font-light"
            />
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={copyPrompt}
              className={cn(
                "flex items-center gap-3 px-10 py-5 rounded-[24px] font-black transition-all transform active:scale-95 shadow-2xl",
                copied
                  ? "bg-vivid-teal text-black"
                  : "bg-vivid-magenta text-white shadow-vivid-glow hover:shadow-vivid-glow-magenta hover:-translate-y-1"
              )}
            >
              {copied ? <Check size={22} /> : <Copy size={22} />}
              {copied ? "COPIED" : "GENERATE PROTOCOL"}
            </button>

            <p className="text-gray-500 max-w-xs leading-relaxed italic text-sm font-light">
              Paste this blueprint into your favorite AI model to generate the application source.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-12 right-12">
        <button
          onClick={() => setIsPublishOpen(true)}
          className="group flex items-center gap-3 bg-white text-black px-8 py-5 rounded-[28px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
        >
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Plus size={20} strokeWidth={3} />
          </div>
          PUBLISH TO NOSTR
        </button>
      </div>

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
      />
    </div>
  );
};
