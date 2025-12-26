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

  test('renders welcome message', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Build something magic/i)).toBeTruthy();
  });

  test('contains "Copy System Prompt" button', () => {
    renderWithProviders(<HomePage />);
    // Use getAllByText if duplicates exist, or be more specific
    const buttons = screen.getAllByText(/Copy System Prompt/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('opens Publish Modal when clicking "Publish App"', () => {
    renderWithProviders(<HomePage />);
    const publishButton = screen.getByRole('button', { name: /Publish App/i });
    fireEvent.click(publishButton);
    
    expect(screen.getByText(/Paste the HTML code/i)).toBeTruthy();
  });
});