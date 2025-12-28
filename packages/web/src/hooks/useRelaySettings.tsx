import { useState, useEffect, useCallback } from 'react';
import { useMirage } from './useMirage';
import { DEFAULT_RELAYS, INITIAL_ENABLED_RELAYS } from '../lib/relays';

export interface RelayStatus {
  url: string;
  name: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  enabled: boolean;
}

export const useRelaySettings = () => {
  const { host, isReady } = useMirage();
  const [enabledUrls, setEnabledUrls] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem('mirage_relays');
    if (stored) {
      try {
        setEnabledUrls(JSON.parse(stored));
      } catch {
        setEnabledUrls(INITIAL_ENABLED_RELAYS);
      }
    } else {
      setEnabledUrls(INITIAL_ENABLED_RELAYS);
    }
  }, []);

  // Poll status
  useEffect(() => {
    if (!isReady || !host) return;

    const poll = async () => {
      try {
        const stats = await host.getRelayStats();
        const statusMap: Record<string, string> = {};
        stats.forEach((s: any) => statusMap[s.url] = s.status);
        setStatuses(statusMap);
      } catch (e) {
        console.warn('Failed to poll relay stats', e);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [host, isReady]);

  // Sync enabledUrls with Host
  // Since useMirage already initializes with persisted relays,
  // this effect mainly handles runtime toggles.
  useEffect(() => {
    if (!isReady || !host || enabledUrls.length === 0) return;

    // Add enabled
    enabledUrls.forEach(url => host.addRelay(url));
    
    // Remove disabled (from our curated list)
    DEFAULT_RELAYS.forEach(r => {
        if (!enabledUrls.includes(r.url)) {
            host.removeRelay(r.url);
        }
    });
    
  }, [host, isReady, enabledUrls]);

  const toggleRelay = useCallback((url: string) => {
    setEnabledUrls(prev => {
      const next = prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url];
      
      localStorage.setItem('mirage_relays', JSON.stringify(next));
      return next;
    });
  }, []);

  const relayList: RelayStatus[] = DEFAULT_RELAYS.map(r => ({
    url: r.url,
    name: r.name,
    status: (statuses[r.url] as any) || 'disconnected',
    enabled: enabledUrls.includes(r.url)
  }));

  return { relayList, toggleRelay };
};
