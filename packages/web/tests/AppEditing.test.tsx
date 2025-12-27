import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { PublishModal } from '../src/components/PublishModal';
import { MirageProvider } from '../src/hooks/useMirage';
import { BrowserRouter } from 'react-router-dom';

// Type augment for window.nostr
declare global {
    interface Window {
        nostr?: {
            getPublicKey: () => Promise<string>;
            signEvent: (event: any) => Promise<any>;
        };
    }
}

// Mock window.nostr
const mockNostr = {
    getPublicKey: async () => 'test-pubkey',
    signEvent: async (event: any) => ({ ...event, sig: 'test-sig', id: 'test-id' }),
};

if (typeof window !== 'undefined') {
    (window as any).nostr = mockNostr;
} else {
    (globalThis as any).window = { nostr: mockNostr };
}

const mockPublishApp = mock(async () => 'naddr-test');
const mockFetchApp = mock(async () => 'code-test');

mock.module('../src/hooks/useMirage', () => ({
    useMirage: () => ({
        publishApp: mockPublishApp,
        fetchApp: mockFetchApp,
        isReady: true,
        pubkey: 'test-pubkey',
        apps: [],
    }),
    MirageProvider: ({ children }: any) => <>{children}</>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );
};

describe('PublishModal - App Management', () => {
    afterEach(() => {
        cleanup();
    });

    test('allows specifying a custom name during creation', async () => {
        renderWithProviders(
            <PublishModal
                isOpen={true}
                onClose={() => { }}
                mode="create"
            />
        );

        const nameInput = screen.getByPlaceholderText(/e.g. My Awesome App/i);
        fireEvent.change(nameInput, { target: { value: 'My Custom App' } });

        expect((nameInput as HTMLInputElement).value).toBe('My Custom App');
    });

    test('pre-fills data in edit mode', () => {
        const initialName = 'Existing App';
        const initialCode = '<h1>Hello</h1>';

        renderWithProviders(
            <PublishModal
                isOpen={true}
                onClose={() => { }}
                mode="edit"
                initialName={initialName}
                initialCode={initialCode}
                existingDTag="test-dtag"
            />
        );

        const nameInput = screen.getByDisplayValue(initialName);
        const codeInput = screen.getByDisplayValue(initialCode);

        expect(nameInput).toBeTruthy();
        expect(codeInput).toBeTruthy();
        expect(screen.getByText(/Apply/i)).toBeTruthy();
        expect(screen.getByText(/Commit Updates/i)).toBeTruthy();
    });

    test('renders in view mode correctly', () => {
        const initialName = 'Third Party App';
        const initialCode = '<script>alert(1)</script>';

        renderWithProviders(
            <PublishModal
                isOpen={true}
                onClose={() => { }}
                mode="view"
                initialName={initialName}
                initialCode={initialCode}
            />
        );

        expect(screen.getByText(/Source/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /Exit Inspector/i })).toBeTruthy();

        // The application name input should NOT be present in view mode
        expect(screen.queryByLabelText(/Application Name/i)).toBeNull();

        // The code should be visible
        expect(screen.getByDisplayValue(initialCode)).toBeTruthy();
    });

    test('shows publishing state during update', async () => {
        renderWithProviders(
            <PublishModal
                isOpen={true}
                onClose={() => { }}
                mode="edit"
                initialName="App"
                initialCode="<code></code>"
                existingDTag="d123"
            />
        );

        const publishButton = screen.getByText(/Commit Updates/i);
        fireEvent.click(publishButton);

        // In publishing state, the button should be disabled
        expect(publishButton.closest('button')?.hasAttribute('disabled')).toBeTruthy();
    });
});
