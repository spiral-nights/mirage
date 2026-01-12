import { Window } from "happy-dom";

const window = new Window();
(globalThis as any).window = window;
(globalThis as any).document = window.document;
(globalThis as any).navigator = window.navigator;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).Element = window.Element; // Added
(globalThis as any).SVGElement = window.SVGElement;
(globalThis as any).Node = window.Node;
(globalThis as any).MessageEvent = window.MessageEvent;
(globalThis as any).requestAnimationFrame = window.requestAnimationFrame;
(globalThis as any).cancelAnimationFrame = window.cancelAnimationFrame;

// Mock Worker
class MockWorker {
  onmessage: ((ev: any) => any) | null = null;
  postMessage(message: any) {
    if (this.onmessage) {
      // Simulate async response to unblock requests
      setTimeout(() => {
        if (message.type === 'API_REQUEST') {
          this.onmessage!({
            data: {
              type: 'API_RESPONSE',
              id: message.id,
              status: 200,
              body: [] // Return empty list for library/spaces
            }
          } as any);
        }
        // Add other message types if needed
      }, 10);
    }
  }
  terminate() { }
}

(globalThis as any).Worker = MockWorker;

// Mock crypto
(globalThis as any).crypto = {
  randomUUID: () => Math.random().toString(36).substring(7),
};

// Mock localStorage
const storageMap: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap[key] || null,
  setItem: (key: string, value: string) => { storageMap[key] = value; },
  removeItem: (key: string) => { delete storageMap[key]; },
  clear: () => { for (const key in storageMap) delete storageMap[key]; },
  length: 0,
  key: (index: number) => Object.keys(storageMap)[index] || null,
};

// Mock matchMedia
(globalThis as any).window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => { },
  removeListener: () => { },
  addEventListener: () => { },
  removeEventListener: () => { },
  dispatchEvent: () => false,
});

// Mock TextEncoder/TextDecoder (Required by nostr-tools)
import { TextEncoder, TextDecoder } from 'util';
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;

// Mock ResizeObserver (Required by framer-motion)
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Mock framer-motion
import { mock } from "bun:test";
mock.module("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => {
      // Convert custom props if needed, or just pass safe DOM props
      // For simplicity, just render a div
      return require('react').createElement('div', { className, ...props }, children);
    },
    section: ({ children, className, ...props }: any) => require('react').createElement('section', { className, ...props }, children),
    // Add other HTML elements as needed
  },
  AnimatePresence: ({ children }: any) => require('react').createElement(require('react').Fragment, {}, children),
}));
