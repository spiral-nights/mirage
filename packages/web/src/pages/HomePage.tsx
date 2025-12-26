import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PublishModal } from '../components/PublishModal';

export const HomePage = () => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const copyPrompt = () => {
    // Placeholder for actual prompt content
    const prompt = "MIRAGE APP ENGINE SYSTEM PROMPT...";
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard!');
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
          
          <h2 className="text-xl font-bold mb-3">Start a new project</h2>
          <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
            Grab the System Prompt, paste it into your favorite AI, and bring the result back here.
          </p>
          
          <button 
            onClick={copyPrompt}
            className="bg-accent-gradient text-white px-8 py-4 rounded-2xl font-bold shadow-accent-glow hover:shadow-accent-glow-hover transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Copy System Prompt
          </button>
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
