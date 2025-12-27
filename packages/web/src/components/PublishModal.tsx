import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useMirage } from '../hooks/useMirage';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal = ({ isOpen, onClose }: PublishModalProps) => {
  const [code, setCode] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { publishApp } = useMirage();
  const navigate = useNavigate();

  const handlePublish = async () => {
    if (!code.trim()) return;

    setIsPublishing(true);
    try {
      const naddr = await publishApp(code, 'New Mirage App');
      console.log('Published app:', naddr);

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setCode('');
        navigate(`/run/${naddr}`);
      }, 1500);
    } catch (error) {
      console.error('Publishing failed:', error);
      alert('Publishing failed. Do you have a Nostr extension (NIP-07) installed?');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-3xl bg-[#050505]/95 border border-white/5 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="p-12 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">
                  Sign & <span className="serif-italic px-1">Publish</span>
                </h2>
                <p className="text-gray-500 text-lg font-light italic">Paste the application cluster source.</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-12 pt-6">
              <div className="relative group">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<html>&#10;  <head>...</head>&#10;  <body>...</body>&#10;</html>"
                  className={cn(
                    "w-full h-80 bg-black/40 border border-white/5 rounded-[32px] p-8",
                    "font-mono text-sm text-gray-400 outline-none transition-all focus:border-vivid-cyan/30 focus:ring-4 focus:ring-vivid-cyan/5",
                    "resize-none placeholder:text-gray-800"
                  )}
                />
                {!code && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                    <UploadCloud size={64} className="mb-6 text-vivid-cyan" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Deployment Payload</span>
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center gap-6">
                <button
                  onClick={handlePublish}
                  disabled={!code.trim() || isPublishing || isSuccess}
                  className={cn(
                    "flex-1 py-5 rounded-[24px] font-black transition-all relative overflow-hidden text-sm uppercase tracking-widest",
                    !code.trim()
                      ? "bg-white/5 text-gray-600 cursor-not-allowed"
                      : "bg-vivid-magenta text-white shadow-vivid-glow hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <span className={cn("transition-opacity flex items-center justify-center gap-3", (isPublishing || isSuccess) ? "opacity-0" : "opacity-100")}>
                    <UploadCloud size={18} />
                    Finalize Deployment
                  </span>

                  {(isPublishing || isSuccess) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isPublishing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 size={24} className="text-vivid-teal" />
                          DEPLOYED
                        </motion.div>
                      )}
                    </div>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="px-10 py-5 bg-transparent border border-white/5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Footer Status */}
            <div className="px-12 py-5 bg-black/60 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-vivid-teal animate-pulse" />
                <span>Protocol Version 1.0</span>
              </div>
              <span>Secured via NIP-07 Signature</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
