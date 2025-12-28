import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SettingsPage } from '../src/pages/SettingsPage';

// Mock useRelaySettings
const mockToggle = mock();
const mockRelayList = [
    { url: 'wss://relay1.test', name: 'Relay One', status: 'connected', enabled: true },
    { url: 'wss://relay2.test', name: 'Relay Two', status: 'disconnected', enabled: false },
];

mock.module('../src/hooks/useRelaySettings', () => ({
    useRelaySettings: () => ({
        relayList: mockRelayList,
        toggleRelay: mockToggle
    })
}));

describe('SettingsPage', () => {
    beforeEach(() => {
        mockToggle.mockClear();
        cleanup();
    });

    test('renders relay list', () => {
        render(<SettingsPage />);
        expect(screen.getByText('Relay One')).toBeTruthy();
        expect(screen.getByText('Relay Two')).toBeTruthy();
        expect(screen.getByText('wss://relay1.test')).toBeTruthy();
    });

    test('displays correct status', () => {
        render(<SettingsPage />);
        expect(screen.getByText('connected')).toBeTruthy();
        expect(screen.getByText('disconnected')).toBeTruthy();
    });

    test('toggles relay', () => {
        render(<SettingsPage />);
        // Use accessible label
        const toggle = screen.getByLabelText('Toggle Relay Two');
        fireEvent.click(toggle);
        expect(mockToggle).toHaveBeenCalledWith('wss://relay2.test');
    });
});
