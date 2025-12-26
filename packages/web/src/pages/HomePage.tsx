import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Check } from 'lucide-react';
import { PublishModal } from '../components/PublishModal';
import { generateSystemPrompt } from '../lib/system-prompt';
import { cn } from '../lib/utils';

export const HomePage = () => {
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
    <div className="max-w-4xl">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Build something magic.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg"
        >
          Create apps with plain English, powered by Nostr.
        </motion.p>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-accent-gradient rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-[#1A1A22] border border-[#2E2E36] rounded-3xl p-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient" />
          
          <h2 className="text-xl font-bold mb-6">Start a new project</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
              What do you want to build?
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. A shared grocery list for my family..."
              className="w-full bg-[#0F0F13] border border-[#2E2E36] rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all resize-none h-32"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={copyPrompt}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95",
                copied 
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-accent-gradient text-white shadow-accent-glow hover:shadow-accent-glow-hover hover:-translate-y-1"
              )}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? "Copied!" : "Copy System Prompt"}
            </button>
            
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Paste this into ChatGPT or Claude to generate your app code.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-12 right-12">
        <button 
          onClick={() => setIsPublishOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-6 py-4 rounded-2xl font-bold shadow-2xl hover:bg-gray-100 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Publish App
        </button>
      </div>

      <PublishModal 
        isOpen={isPublishOpen} 
        onClose={() => setIsPublishOpen(false)} 
      />
    </div>
  );
};
