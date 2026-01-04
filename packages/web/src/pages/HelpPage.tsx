
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book,
    Code2,
    Database,
    LayoutGrid,
    Shield,
    Users,
    Globe,
    Server,
    Key,
    Send
} from 'lucide-react';
import { cn } from '../lib/utils';

export const HelpPage = () => {
    const [mode, setMode] = useState<'user' | 'tech'>('user');

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                            Using <span className="text-transparent bg-clip-text bg-brand-gradient">Mirage</span>
                        </h1>
                        <p className="text-gray-500 text-xl font-light max-w-xl">
                            Understanding the core concepts of the decentralized web.
                        </p>
                    </div>

                    <div className="bg-surface border border-white/10 p-1 rounded-2xl flex items-center gap-1 self-start">
                        <button
                            onClick={() => setMode('user')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm",
                                mode === 'user'
                                    ? "bg-white text-black shadow-lg"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Book size={16} />
                            Simple
                        </button>
                        <button
                            onClick={() => setMode('tech')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm",
                                mode === 'tech'
                                    ? "bg-vivid-cyan text-black shadow-lg shadow-vivid-cyan/20"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Code2 size={16} />
                            Technical
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid gap-12">
                <ConceptSection
                    title="Apps"
                    icon={LayoutGrid}
                    color="text-vivid-magenta"
                    mode={mode}
                    userContent={
                        <div className="space-y-4">
                            <p>
                                An <strong>App</strong> in Mirage is just like any other website or tool you use, but with one key difference: it doesn't own your data.
                            </p>
                            <p>
                                When you use a Mirage app (like a notepad, a calendar, or a game), you bring your own data "backpack" (a Space). The app creates an interface for you to view and edit that data, but the data itself stays in your backpack.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Globe} text="Accessed through your browser" />
                                <FeatureItem icon={Shield} text="Cannot see data from your other spaces" />
                            </ul>
                        </div>
                    }
                    techContent={
                        <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-400">
                            <p>
                                A Mirage <strong>App</strong> is a self-contained web application (HTML/JS/CSS) stored immutably on Nostr relays as a <span className="text-vivid-cyan">Kind 30078</span> event (or similar parameterized replaceable event).
                            </p>
                            <p>
                                Apps run inside a sandboxed iframe within the Mirage Host. They utilize the <span className="text-vivid-cyan">Mirage Engine API</span> (via window.postMessage) to request data. They are stateless by default and must request access to a storage context (Space) to persist information.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Server} text="Hosted on decentralized relays" />
                                <FeatureItem icon={Code2} text="Sandboxed execution environment" />
                            </ul>
                        </div>
                    }
                />

                <ConceptSection
                    title="Spaces"
                    icon={Database}
                    color="text-vivid-cyan"
                    mode={mode}
                    userContent={
                        <div className="space-y-4">
                            <p>
                                A <strong>Space</strong> is a secure, private room for your data. Think of it like a folder on your computer, or a separate notebook.
                            </p>
                            <p>
                                You can create multiple Spaces for the same App. For example, if you have a "Project Manager" app, you might create one Space for "Work Projects" and another for "Personal Projects". Data in one space is completely invisible to the other.
                            </p>
                            <p>
                                Spaces are using <strong>symmetric encryption</strong>, meaning everyone in the space shares the same key to read and write data. This key is securely shared with you when you are invited.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Key} text="Encrypted and private by default" />
                                <FeatureItem icon={Users} text="Invite others to collaborate" />
                            </ul>
                        </div>
                    }
                    techContent={
                        <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-400">
                            <p>
                                A <strong>Space</strong> relies on a shared <strong>symmetric encryption key</strong>. All events within the space are encrypted using this key.
                            </p>
                            <p>
                                When a space is created, a random symmetric key is generated. This key is never published in plaintext. Instead, it is stored in your private NIP-78 keychain encypted to your own public key.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Shield} text="Symmetric Encryption (Shared Key)" />
                                <FeatureItem icon={Database} text="Scoped Query Validation" />
                            </ul>
                        </div>
                    }
                />

                <ConceptSection
                    title="Invites"
                    icon={Send}
                    color="text-vivid-yellow"
                    mode={mode}
                    userContent={
                        <div className="space-y-4">
                            <p>
                                Sending an <strong>Invite</strong> is like creating a secure copy of the key to your Space and handing it to a friend.
                            </p>
                            <p>
                                When you invite someone, Mirage securely packages the Space's key and sends it to them. Their Mirage app automatically detects this package, unlocks it, and adds the Space to their library.
                            </p>
                            <p>
                                This happens entirely in the background. You don't need to copy-paste distinct keys or passwords; the invitation system handles the handshake for you.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Send} text="Secure automated delivery" />
                                <FeatureItem icon={Users} text="Auto-discovery of invitations" />
                            </ul>
                        </div>
                    }
                    techContent={
                        <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-400">
                            <p>
                                <strong>Invites</strong> utilize <strong>NIP-17 Gift Wraps</strong> (Kind 1059) to securely distribute the Space's symmetric key.
                            </p>
                            <p>
                                1. <strong>Wrapping:</strong> The inviter encrypts the Space's symmetric key to the recipient's public key and wraps it in a sealed rumor event (Kind 13).
                            </p>
                            <p>
                                2. <strong>Delivery:</strong> This wrapped package is published as a Gift Wrap event to the connected relays.
                            </p>
                            <p>
                                3. <strong>Discovery:</strong> The recipient's Engine runs a background background process that scans for new Gift Wraps, decrypts them, and automatically merges the new keys into their local NIP-78 keychain.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <FeatureItem icon={Shield} text="NIP-17 Gift Wraps (Kind 1059)" />
                                <FeatureItem icon={Server} text="Background Sync & Decryption" />
                            </ul>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

const ConceptSection = ({
    title,
    icon: Icon,
    color,
    mode,
    userContent,
    techContent
}: {
    title: string;
    icon: any;
    color: string;
    mode: 'user' | 'tech';
    userContent: React.ReactNode;
    techContent: React.ReactNode;
}) => (
    <div className="bg-surface border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-8 md:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-6 mb-6">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-background border border-white/5 shadow-inner", color)}>
                    <Icon size={32} />
                </div>
                <h2 className="text-3xl font-black">{title}</h2>
            </div>
            <div className="min-h-[160px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === 'user' ? userContent : techContent}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </div>
);

const FeatureItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <li className="flex items-center gap-3 text-sm text-gray-500">
        <Icon size={16} className="text-gray-400" />
        {text}
    </li>
);
