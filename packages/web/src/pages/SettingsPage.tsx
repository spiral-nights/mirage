import { motion } from 'framer-motion';
import { useRelaySettings } from '../hooks/useRelaySettings';
import { useAppSettings } from '../hooks/useAppSettings';
import { cn } from '../lib/utils';
import { Smartphone, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export const SettingsPage = () => {
  const { relayList, toggleRelay } = useRelaySettings();
  const { settings, updateSettings } = useAppSettings();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Basic mobile detection
    const checkMobile = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobilePlatform = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      setIsMobile(isMobilePlatform || (isTouch && window.innerWidth < 1024));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black mb-4 tracking-tight">
          System <span className="serif-italic text-vivid-cyan">Settings</span>
        </h1>
        <p className="text-gray-500 text-lg font-light">
          Configure your device and network preferences.
        </p>
      </header>

      {/* Device Settings - Mobile Only */}
      {isMobile && (
        <div className="bg-card/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl mb-8">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone size={16} />
              Device Preferences
            </h2>
          </div>

          <div className="divide-y divide-white/5">
            <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-vivid-magenta">
                  <Monitor size={20} />
                </div>
                <div>
                  <div className="font-bold text-white mb-1">Prevent Screen Sleep</div>
                  <div className="text-xs text-gray-500">Keep the screen awake while using Mirage</div>
                </div>
              </div>

              <button
                onClick={() => updateSettings({ wakeLockEnabled: !settings.wakeLockEnabled })}
                role="switch"
                aria-checked={settings.wakeLockEnabled}
                className={cn(
                  "w-14 h-8 rounded-full p-1 transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-vivid-magenta/50",
                  settings.wakeLockEnabled ? "bg-vivid-magenta/20" : "bg-white/5"
                )}
              >
                <motion.div
                  className={cn(
                    "w-6 h-6 rounded-full shadow-lg",
                    settings.wakeLockEnabled ? "bg-vivid-magenta" : "bg-gray-500"
                  )}
                  animate={{ x: settings.wakeLockEnabled ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
            Public Relays
          </h2>
        </div>

        <div className="divide-y divide-white/5">
          {relayList.map((relay) => (
            <div key={relay.url} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    relay.status === 'connected' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                      relay.status === 'connecting' ? "bg-yellow-500 animate-pulse" :
                        relay.status === 'error' ? "bg-red-500" :
                          "bg-gray-600"
                  )} />
                </div>
                <div>
                  <div className="font-bold text-white mb-1">{relay.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{relay.url}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-600 w-24 text-right">
                  {relay.status}
                </div>

                <button
                  onClick={() => toggleRelay(relay.url)}
                  role="switch"
                  aria-checked={relay.enabled}
                  aria-label={`Toggle ${relay.name}`}
                  className={cn(
                    "w-14 h-8 rounded-full p-1 transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-vivid-cyan/50",
                    relay.enabled ? "bg-vivid-cyan/20" : "bg-white/5"
                  )}
                >
                  <motion.div
                    className={cn(
                      "w-6 h-6 rounded-full shadow-lg",
                      relay.enabled ? "bg-vivid-cyan" : "bg-gray-500"
                    )}
                    animate={{ x: relay.enabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
