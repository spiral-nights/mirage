import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type AppDefinition } from '@mirage/core';

interface AppActionsContextType {
    app: AppDefinition | null;
    space?: { id: string; name: string; offline?: boolean } | null;
    isAuthor: boolean;
    onViewEditSource: (() => void) | null;
    onInvite: ((spaceId?: string) => void) | null;
    onExit: (() => void) | null;
    setAppActions: (actions: Omit<AppActionsContextType, 'setAppActions'>) => void;
}

const AppActionsContext = createContext<AppActionsContextType | undefined>(undefined);

export const AppActionsProvider = ({ children }: { children: ReactNode }) => {
    const [app, setApp] = useState<AppDefinition | null>(null);
    const [space, setSpace] = useState<{ id: string; name: string; offline?: boolean } | null | undefined>(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [onViewEditSource, setOnViewEditSource] = useState<(() => void) | null>(null);
    const [onInvite, setOnInvite] = useState<((spaceId?: string) => void) | null>(null);
    const [onExit, setOnExit] = useState<(() => void) | null>(null);

    const setAppActions = useCallback((actions: Omit<AppActionsContextType, 'setAppActions'>) => {
        setApp(actions.app);
        setSpace(actions.space);
        setIsAuthor(actions.isAuthor);
        setOnViewEditSource(() => actions.onViewEditSource);
        setOnInvite(() => actions.onInvite);
        setOnExit(() => actions.onExit);
    }, []);

    return (
        <AppActionsContext.Provider
            value={{
                app,
                space,
                isAuthor,
                onViewEditSource,
                onInvite,
                onExit,
                setAppActions,
            }}
        >
            {children}
        </AppActionsContext.Provider>
    );
};

export const useAppActions = () => {
    const context = useContext(AppActionsContext);
    if (context === undefined) {
        throw new Error('useAppActions must be used within AppActionsProvider');
    }
    return context;
};
