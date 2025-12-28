import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HomePage } from '../src/pages/HomePage';
import { MirageProvider } from '../src/hooks/useMirage';
import { BrowserRouter } from 'react-router-dom';

// Mock window.nostr
const mockNostr = {
  getPublicKey: async () => 'test-pubkey',
  signEvent: async (event: any) => ({ ...event, sig: 'test-sig', id: 'test-id' }),
};

(globalThis as any).window.nostr = mockNostr;

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MirageProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </MirageProvider>
  );
};

describe('HomePage', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders welcome message', async () => {
    renderWithProviders(<HomePage />);
    // Match part of the text to avoid issues with splits across elements (<br />)
    expect(await screen.findByText(/Build something/i)).toBeTruthy();
  });

  test('contains "GENERATE PROTOCOL" button', async () => {
    renderWithProviders(<HomePage />);
    const buttons = await screen.findAllByText(/GENERATE PROTOCOL/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('opens Publish Modal when clicking "Publish App"', async () => {
    renderWithProviders(<HomePage />);
    const publishButton = await screen.findByRole('button', { name: /Publish App/i });
    fireEvent.click(publishButton);
    
    // Wait for modal to appear.
    expect(await screen.findByText(/Cluster Payload/i)).toBeTruthy();
  });
});