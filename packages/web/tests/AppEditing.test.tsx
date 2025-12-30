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

    test('allows entering HTML code during creation', async () => {
        renderWithProviders(
            <PublishModal
                isOpen={true}
                onClose={() => { }}
                mode="create"
            />
        );

        const codeInput = screen.getByPlaceholderText(/<html>/i);
        fireEvent.change(codeInput, { target: { value: '<h1>Test App</h1>' } });

        expect((codeInput as HTMLTextAreaElement).value).toBe('<h1>Test App</h1>');
        expect(screen.getByText(/Preview App/i)).toBeTruthy();
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
        expect(screen.getByText(/Preview Changes/i)).toBeTruthy();
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

    test('shows preview button for update', async () => {
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

        const previewButton = screen.getByText(/Preview Changes/i);
        expect(previewButton).toBeTruthy();
        expect(previewButton.closest('button')?.hasAttribute('disabled')).toBeFalsy();
    });
});
