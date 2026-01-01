import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { InviteModal } from '../src/components/InviteModal';

// Mock Host
const mockInviteToSpace = mock(async () => {});
const mockRequest = mock(async (method: string, path: string) => {
    if (path.includes('/profiles/')) {
        return { profile: { name: 'Test User', picture: 'https://example.com/pic.jpg' } };
    }
    return {};
});

const mockHost = {
    inviteToSpace: mockInviteToSpace,
    request: mockRequest,
};

// Mock useMirage hook
mock.module("../src/hooks/useMirage", () => {
    return {
        useMirage: () => ({
            host: mockHost,
            isReady: true,
            pubkey: 'test-pubkey',
            apps: [],
        }),
    };
});

describe('InviteModal', () => {
    afterEach(() => {
        cleanup();
        mockInviteToSpace.mockClear();
        mockRequest.mockClear();
    });

    test('renders correctly', () => {
        render(<InviteModal isOpen={true} onClose={() => {}} spaceId="123" spaceName="Test Space" />);
        expect(screen.getByText('Invite to')).toBeTruthy();
        expect(screen.getByText('Test Space')).toBeTruthy();
    });

    test('input validation for hex pubkey', async () => {
        render(<InviteModal isOpen={true} onClose={() => {}} spaceId="123" spaceName="Test Space" />);
        
        const input = screen.getByPlaceholderText('npub1...');
        const validHex = 'a'.repeat(64);
        
        fireEvent.change(input, { target: { value: validHex } });
        
        // Wait for debounce and profile fetch
        await waitFor(() => {
            expect(mockRequest).toHaveBeenCalled();
        });

        // Should show profile
        expect(screen.getByText('Test User')).toBeTruthy();
    });

    test('calls inviteToSpace on send', async () => {
        render(<InviteModal isOpen={true} onClose={() => {}} spaceId="123" spaceName="Test Space" />);
        
        const input = screen.getByPlaceholderText('npub1...');
        const validHex = 'a'.repeat(64);
        
        fireEvent.change(input, { target: { value: validHex } });
        
        // Wait for profile (validation pass)
        await waitFor(() => expect(screen.getByText('Test User')).toBeTruthy());

        const sendBtn = screen.getByRole('button', { name: /Send Invite/i });
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(mockInviteToSpace).toHaveBeenCalledWith('123', validHex, 'Test Space');
        });
        
        expect(screen.getByText('Sent!')).toBeTruthy();
    });
});
