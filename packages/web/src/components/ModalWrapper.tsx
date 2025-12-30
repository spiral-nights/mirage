import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode } from 'react';

interface ModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string; // For customizing the inner content container (e.g. max-w-xl)
}

/**
 * Standardized modal wrapper that respects the sidebar layout.
 * On desktop, it offsets the overlay by the sidebar width (md:left-64)
 * so the modal sits within the content area, not covering the nav.
 */
export const ModalWrapper = ({ isOpen, onClose, children, className = '' }: ModalWrapperProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className={`relative w-full bg-[#050505]/95 border border-white/5 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] ${className}`}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
