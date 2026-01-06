import { useState, useEffect, useCallback } from 'react';

// Define app settings types
export interface AppSettings {
    wakeLockEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    wakeLockEnabled: false
};

const STORAGE_KEY = 'mirage_app_settings';

export const useAppSettings = () => {
    // Initialize from local storage
    const [settings, setSettings] = useState<AppSettings>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            } catch {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    // Listen for custom event to sync state across components in the same tab
    useEffect(() => {
        const handleSettingsChange = (e: CustomEvent<AppSettings>) => {
            setSettings(e.detail);
        };

        window.addEventListener('mirage-settings-changed', handleSettingsChange as EventListener);
        return () => window.removeEventListener('mirage-settings-changed', handleSettingsChange as EventListener);
    }, []);

    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };

            // Persist to storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // Dispatch event for other components asynchronously to avoid
            // "Cannot update a component while rendering a different component" error
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('mirage-settings-changed', { detail: updated }));
            }, 0);

            return updated;
        });
    }, []);

    return {
        settings,
        updateSettings
    };
};
