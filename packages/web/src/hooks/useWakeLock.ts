import { useEffect, useRef, useState } from 'react';

export const useWakeLock = (enabled: boolean) => {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // If disabled, release any existing lock
        if (!enabled) {
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
                wakeLockRef.current = null;
                setIsActive(false);
            }
            return;
        }

        const requestLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const lock = await navigator.wakeLock.request('screen');
                    wakeLockRef.current = lock;
                    setIsActive(true);

                    lock.addEventListener('release', () => {
                        setIsActive(false);
                        // Don't clear ref here necessarily, as it's already released
                    });
                }
            } catch (err: any) {
                // Ignore AbortError and NotAllowedError (common when tab hidden)
                if (err.name !== 'AbortError') {
                    console.warn('Wake Lock failed:', err);
                }
                setIsActive(false);
            }
        };

        // Initial request
        if (!wakeLockRef.current) {
            requestLock();
        }

        // Re-request on visibility change (locks are released when tab is hidden)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !wakeLockRef.current) {
                requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => { });
                wakeLockRef.current = null;
            }
        };
    }, [enabled]);

    return isActive;
};
