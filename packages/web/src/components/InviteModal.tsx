import { useState, useEffect } from 'react';
import { X, Send, User, Clipboard, CheckCircle, AlertCircle } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useMirage } from '../hooks/useMirage';
import { ModalWrapper } from './ModalWrapper';
import { cn } from '../lib/utils';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
}

interface Profile {
  name?: string;
  picture?: string;
  nip05?: string;
}

export const InviteModal = ({ isOpen, onClose, spaceId, spaceName }: InviteModalProps) => {
  const { host } = useMirage();
  const [input, setInput] = useState('');
  const [parsedPubkey, setParsedPubkey] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate and parse input on change
  useEffect(() => {
    const parseInput = async () => {
      setParsedPubkey(null);
      setProfile(null);
      setError(null);

      if (!input.trim()) return;

      try {
        let pubkey = input.trim();
        
        // Handle NPUB
        if (pubkey.startsWith('npub')) {
          try {
            const decoded = nip19.decode(pubkey);
            if (decoded.type === 'npub') {
              pubkey = decoded.data;
            } else {
              throw new Error('Invalid npub');
            }
          } catch (e) {
            // Only show error if it looks like an npub but fails
            if (input.length > 10) setError('Invalid NPUB format');
            return;
          }
        } 
        // Handle Hex (basic check)
        else if (pubkey.match(/^[0-9a-fA-F]{64}$/)) {
            // valid hex
        } else {
            // Check for potential NIP-05 later? For now strict pubkey/npub
            if (input.length > 10) setError('Invalid format. Use NPUB or Hex.');
            return;
        }

        setParsedPubkey(pubkey);
        fetchProfile(pubkey);
      } catch (e) {
        // quiet fail
      }
    };

    const timeout = setTimeout(parseInput, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [input]);

  const fetchProfile = async (pubkey: string) => {
    if (!host) return;
    setIsLoadingProfile(true);
    try {
      console.log(`[InviteDebug] Fetching profile for: ${pubkey}`);
      const res = await host.request('GET', `/mirage/v1/profiles/${pubkey}`);
      if (res && res.profile) {
        console.log(`[InviteDebug] Profile found: ${res.profile.name || 'no name'}`);
        setProfile(res.profile);
      } else {
        console.log(`[InviteDebug] No profile found for ${pubkey}`);
      }
    } catch (e) {
      console.warn(`[InviteDebug] Failed to fetch profile:`, e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      console.log(`[InviteDebug] Pasted from clipboard: ${text.slice(0, 10)}...`);
    } catch (e) {
      console.error('[InviteDebug] Clipboard access denied');
    }
  };

  const handleSend = async () => {
    if (!parsedPubkey || !host) return;
    setIsSending(true);
    setError(null);
    try {
      console.log(`[InviteDebug] Initiating invite to space: ${spaceId} (${spaceName}) for pubkey: ${parsedPubkey}`);
      await host.inviteToSpace(spaceId, parsedPubkey, spaceName);
      console.log(`[InviteDebug] host.inviteToSpace call successful`);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setInput('');
      }, 2000);
    } catch (e: any) {
      console.error(`[InviteDebug] Failed to send invite:`, e);
      setError(e.message || 'Failed to send invite');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-8 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black mb-1 tracking-tight">
            Invite to <span className="text-vivid-cyan">{spaceName}</span>
          </h2>
          <p className="text-gray-500 text-xs font-light italic">
            Securely share access via NIP-17 Gift Wrap.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-8 pt-4 space-y-6">
        {/* Input */}
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-2">
            Recipient (NPUB)
          </label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="npub1..."
              className={cn(
                "w-full bg-black/40 border rounded-2xl px-5 py-3 pr-12 text-white outline-none transition-all font-mono text-sm",
                error 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-white/5 focus:border-vivid-cyan/30"
              )}
            />
            <button 
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                title="Paste from Clipboard"
            >
                <Clipboard size={16} />
            </button>
          </div>
          {error && (
             <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                 <AlertCircle size={12} />
                 <span>{error}</span>
             </div>
          )}
        </div>

        {/* Profile Preview */}
        {(parsedPubkey || isLoadingProfile) && (
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {isLoadingProfile ? (
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vivid-cyan to-blue-600 flex items-center justify-center overflow-hidden shrink-0">
                        {profile?.picture ? (
                            <img src={profile.picture} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-white" />
                        )}
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    {isLoadingProfile ? (
                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-1" />
                    ) : (
                        <div className="font-bold text-white truncate">
                            {profile?.name || 'Unknown Profile'}
                        </div>
                    )}
                    <div className="text-[10px] text-gray-500 font-mono truncate">
                        {parsedPubkey ? `${parsedPubkey.slice(0, 10)}...${parsedPubkey.slice(-8)}` : '...'}
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSend}
          disabled={!parsedPubkey || isSending || !!error}
          className={cn(
            "w-full py-4 rounded-2xl font-black transition-all relative overflow-hidden text-sm uppercase tracking-widest flex items-center justify-center gap-3",
            success 
                ? "bg-green-500 text-white"
                : (!parsedPubkey || isSending || !!error)
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-vivid-cyan text-[#050505] shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
          ) : success ? (
            <>
                <CheckCircle size={18} />
                Sent!
            </>
          ) : (
            <>
              <Send size={18} />
              Send Invite
            </>
          )}
        </button>
      </div>
    </ModalWrapper>
  );
};
