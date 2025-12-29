import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'view';
  initialName?: string;
  initialCode?: string;
  existingDTag?: string;
  returnTo?: string; // Where to return on preview cancel (e.g., /create or /run/naddr...)
}

export const PublishModal = ({
  isOpen,
  onClose,
  mode = 'create',
  initialName = '',
  initialCode = '',
  existingDTag,
  returnTo = '/create',
}: PublishModalProps) => {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  // Reset fields when opening/mode changes
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCode(initialCode);
    }
  }, [isOpen, initialName, initialCode]);

  const handlePreview = () => {
    if (!code.trim()) return;

    // Navigate to preview page with appropriate state, including where to return on cancel
    if (mode === 'create') {
      navigate('/preview', {
        state: {
          code,
          mode: 'create',
          returnTo,
        },
      });
    } else if (mode === 'edit') {
      navigate('/preview', {
        state: {
          code,
          mode: 'edit',
          appName: name,
          existingDTag,
          returnTo,
        },
      });
    }

    // Close the modal
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

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
                  {isView ? (
                    <>Source <span className="serif-italic px-1">Inspector</span></>
                  ) : isEdit ? (
                    <>Apply <span className="serif-italic px-1">Changes</span></>
                  ) : (
                    <>Sign & <span className="serif-italic px-1">Publish</span></>
                  )}
                </h2>
                <p className="text-gray-500 text-lg font-light italic">
                  {isView
                    ? "Viewing raw application protocol."
                    : "Configure and deploy your application cluster."}
                </p>
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
              {!isView && mode === 'edit' && (
                <div className="mb-8">
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-3">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Awesome App"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-vivid-magenta/30 focus:ring-4 focus:ring-vivid-magenta/5 outline-none transition-all font-medium"
                  />
                </div>
              )}

              <div className="relative group">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white backdrop-blur-md border border-white/5"
                  >
                    {copied ? <Check size={16} className="text-vivid-teal" /> : <Copy size={16} />}
                  </button>
                </div>
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-3 ml-1">
                  Cluster Payload (HTML/JS)
                </label>
                <textarea
                  value={code}
                  readOnly={isView}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<html>&#10;  <head>...</head>&#10;  <body>...</body>&#10;</html>"
                  className={cn(
                    "w-full h-80 bg-black/40 border border-white/5 rounded-[32px] p-8",
                    "font-mono text-xs text-gray-400 outline-none transition-all",
                    isView
                      ? "cursor-default"
                      : "focus:border-vivid-cyan/30 focus:ring-4 focus:ring-vivid-cyan/5",
                    "resize-none placeholder:text-gray-800"
                  )}
                />
                {!code && !isView && (
                  <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                    <UploadCloud size={64} className="mb-6 text-vivid-cyan" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Source Code Required</span>
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center gap-6">
                {!isView ? (
                  <button
                    onClick={handlePreview}
                    disabled={!code.trim()}
                    className={cn(
                      "flex-1 py-5 rounded-[24px] font-black transition-all relative overflow-hidden text-sm uppercase tracking-widest",
                      !code.trim()
                        ? "bg-white/5 text-gray-600 cursor-not-allowed"
                        : "bg-vivid-magenta text-white shadow-vivid-glow hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <UploadCloud size={18} />
                      {mode === 'edit' ? 'Preview Changes' : 'Preview App'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 py-5 bg-vivid-cyan/10 text-vivid-cyan border border-vivid-cyan/20 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-vivid-cyan/20 transition-all"
                  >
                    Exit Inspector
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-10 py-5 bg-transparent border border-white/5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  {isView ? "Close" : "Cancel"}
                </button>
              </div>
            </div>

            {/* Footer Status */}
            <div className="px-12 py-5 bg-black/60 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", isView ? "bg-gray-600" : "bg-vivid-teal animate-pulse")} />
                <span>{isView ? "Read Only Access" : "Protocol Version 1.0"}</span>
              </div>
              <div className="flex items-center gap-4">
                {isEdit && <span>ID: {existingDTag?.slice(-8)}</span>}
                <span>Secured via NIP-07 Signature</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
