import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key,
    Shield,
    PlusCircle,
    Fingerprint,
    ArrowRight,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import {
    createNewSecretKey,
    encodeNsec,
    validateAndDecodeKey,
    injectSigner,
    isPrfSupported,
    derivePrfKey,
    encryptWithPrfKey,
    saveIdentity,
    loadIdentity,
    bytesToBase64
} from '@mirage/host';

interface LoginModalProps {
    isOpen: boolean;
    onSuccess: (pubkey: string) => void;
}

type LoginStep = 'landing' | 'manual' | 'generate' | 'webauthn-setup';

export const LoginModal = ({ isOpen, onSuccess }: LoginModalProps) => {
    const [step, setStep] = useState<LoginStep>('landing');
    const [nsecInput, setNsecInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasExtension, setHasExtension] = useState(false);
    const [prfStatus, setPrfStatus] = useState<'loading' | 'supported' | 'unsupported'>('loading');
    const [generatedKey, setGeneratedKey] = useState<Uint8Array | null>(null);

    useEffect(() => {
        setHasExtension(!!(window as any).nostr);
        isPrfSupported().then(supported => {
            setPrfStatus(supported ? 'supported' : 'unsupported');
        }).catch(() => {
            setPrfStatus('unsupported');
        });
    }, []);

    const handleExtensionLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const nostr = (window as any).nostr;
            if (!nostr) throw new Error("No extension detected");
            const pubkey = await nostr.getPublicKey();
            onSuccess(pubkey);
        } catch (e: any) {
            setError(e.message || "Failed to connect to extension");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualLogin = async () => {
        setError(null);
        const sk = validateAndDecodeKey(nsecInput);
        if (!sk) {
            setError("Invalid secret key. Please check your nsec.");
            return;
        }

        if (prfStatus === 'supported') {
            setGeneratedKey(sk);
            setStep('webauthn-setup');
        } else {
            completeLogin(sk);
        }
    };

    const handleGenerate = () => {
        const sk = createNewSecretKey();
        setGeneratedKey(sk);
        setStep('generate');
    };

    const completeLogin = (sk: Uint8Array) => {
        const signer = injectSigner(sk);
        signer.getPublicKey().then(onSuccess);
    };

    const handleWebAuthnSetup = async (useWebAuthn: boolean) => {
        if (!generatedKey) return;
        setIsLoading(true);
        setError(null);
        try {
            if (useWebAuthn) {
                const { key, credentialId } = await derivePrfKey();
                const encrypted = await encryptWithPrfKey(key, encodeNsec(generatedKey));
                saveIdentity({
                    credentialId: bytesToBase64(credentialId),
                    ciphertext: encrypted.ciphertext,
                    iv: encrypted.iv
                });
            }
            completeLogin(generatedKey);
        } catch (e: any) {
            console.error("WebAuthn failed:", e);
            setError("Biometric setup failed. You can still login without it.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlockWithBiometrics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stored = loadIdentity();
            if (!stored) throw new Error("No saved identity found");

            const { key } = await derivePrfKey({
                credentialId: Uint8Array.from(atob(stored.credentialId), c => c.charCodeAt(0))
            });
            const nsec = await (await import('@mirage/host')).decryptWithPrfKey(key, stored.ciphertext, stored.iv);
            const sk = validateAndDecodeKey(nsec);
            if (!sk) throw new Error("Decryption failed to produce valid key");

            completeLogin(sk);
        } catch (e: any) {
            setError("Failed to unlock. Please try again or use your nsec manually.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={() => { }} fullScreen={true} className="max-w-md">
            <div className="p-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-gradient rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                        Access Mirage
                    </h2>
                    <p className="text-gray-500 text-xs mt-2 text-center uppercase tracking-[0.2em] font-bold">
                        Secure Identity Gateway
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-3"
                        >
                            {loadIdentity() && (
                                <button
                                    onClick={handleUnlockWithBiometrics}
                                    disabled={isLoading}
                                    className="flex items-center gap-4 w-full p-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Fingerprint size={20} />
                                    <span className="flex-1 text-left">Unlock with Biometrics</span>
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                </button>
                            )}

                            {hasExtension && (
                                <button
                                    onClick={handleExtensionLogin}
                                    disabled={isLoading}
                                    className="flex items-center gap-4 w-full p-5 bg-surface border border-white/5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all"
                                >
                                    <Key size={20} className="text-vivid-cyan" />
                                    <span className="flex-1 text-left">Nostr Extension</span>
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                </button>
                            )}

                            <button
                                onClick={() => setStep('manual')}
                                className="flex items-center gap-4 w-full p-5 bg-surface border border-white/5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all"
                            >
                                <PlusCircle size={20} className="text-vivid-magenta" />
                                <span className="flex-1 text-left">Use Secret Key (nsec)</span>
                                <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={handleGenerate}
                                className="mt-4 text-[10px] text-gray-500 hover:text-white uppercase tracking-[0.3em] font-black transition-colors"
                            >
                                Generate New Identity
                            </button>
                        </motion.div>
                    )}

                    {step === 'manual' && (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleManualLogin();
                                }}
                            >
                                <div className="mb-6">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2 block">
                                        Enter Secret Key (nsec...)
                                    </label>
                                    <input
                                        type="password"
                                        value={nsecInput}
                                        onChange={(e) => setNsecInput(e.target.value)}
                                        placeholder="nsec1..."
                                        className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-vivid-cyan focus:outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={!nsecInput || isLoading || prfStatus === 'loading'}
                                        className="w-full p-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {prfStatus === 'loading' ? 'Checking Security...' : 'Continue'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('landing')}
                                        className="w-full p-4 text-gray-500 text-xs uppercase tracking-widest font-black hover:text-white"
                                    >
                                        Back
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 'generate' && (
                        <motion.div
                            key="generate"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">
                                We've generated a secure new identity for you. <br />
                                <strong className="text-vivid-magenta">Save this key immediately!</strong><br />
                                You cannot recover it if lost.
                            </p>

                            <div className="bg-[#111] border border-vivid-magenta/20 rounded-xl p-4 mb-8 relative group overflow-hidden">
                                <p className="font-mono text-[10px] break-all text-gray-300">
                                    {generatedKey ? encodeNsec(generatedKey) : ''}
                                </p>
                            </div>

                            <button
                                onClick={() => prfStatus === 'supported' ? setStep('webauthn-setup') : completeLogin(generatedKey!)}
                                className="w-full p-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                I've Saved It
                            </button>
                        </motion.div>
                    )}

                    {step === 'webauthn-setup' && (
                        <motion.div
                            key="webauthn-setup"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-vivid-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Fingerprint className="text-vivid-cyan" size={24} />
                            </div>
                            <h3 className="text-white font-black uppercase tracking-widest text-lg mb-4">
                                Secure with Biometrics?
                            </h3>
                            <p className="text-xs text-gray-500 mb-8 leading-relaxed uppercase tracking-wider font-bold">
                                Use TouchID, FaceID, or your Windows Hello to securely unlock Mirage without entering your key every time.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleWebAuthnSetup(true)}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-3 w-full p-5 bg-vivid-cyan text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    Enable & Continue
                                </button>
                                <button
                                    onClick={() => handleWebAuthnSetup(false)}
                                    disabled={isLoading}
                                    className="w-full p-4 text-gray-500 text-xs uppercase tracking-widest font-black hover:text-white"
                                >
                                    Skip for Now
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                    >
                        <AlertCircle className="text-red-500 shrink-0" size={16} />
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider leading-tight">
                            {error}
                        </p>
                    </motion.div>
                )}
            </div>
        </ModalWrapper>
    );
};