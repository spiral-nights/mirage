import { useState, useCallback, useEffect } from 'react';
import { useMirage } from './useMirage';

export interface Space {
  id: string;
  name: string;
  appOrigin: string;
  createdAt: number;
}

export function useSpaces() {
  const { host, isReady } = useMirage();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSpaces = useCallback(async () => {
    if (!host || !isReady) return;
    setLoading(true);
    try {
      // Use listAllSpaces to get spaces for all apps
      const data = await host.request('GET', '/mirage/v1/spaces/all');
      if (Array.isArray(data)) {
        setSpaces(data);
      }
    } catch (e) {
      console.error('[useSpaces] Refresh failed:', e);
    } finally {
      setLoading(false);
    }
  }, [host, isReady]);

  const createSpace = useCallback(async (name: string, appId: string) => {
    if (!host) return null;
    try {
      const space = await host.createSpace(name, appId);
      await refreshSpaces();
      return space;
    } catch (e) {
      console.error('[useSpaces] Create failed:', e);
      return null;
    }
  }, [host, refreshSpaces]);

  const deleteSpace = useCallback(async (spaceId: string) => {
    if (!host) return false;
    try {
      await host.deleteSpace(spaceId);
      setSpaces(prev => prev.filter(s => s.id !== spaceId));
      return true;
    } catch (e) {
      console.error('[useSpaces] Delete failed:', e);
      return false;
    }
  }, [host]);

  // Initial load
  useEffect(() => {
    if (isReady) {
      refreshSpaces();
    }
  }, [isReady, refreshSpaces]);

  return { spaces, loading, refreshSpaces, createSpace, deleteSpace };
}
