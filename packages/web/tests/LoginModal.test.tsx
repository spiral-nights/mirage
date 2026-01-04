import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { LoginModal } from "../src/components/LoginModal";
import React from 'react';

// Mock @mirage/host
const mockIsPrfSupported = mock(() => Promise.resolve(false));

mock.module("@mirage/host", () => ({
    createNewSecretKey: () => new Uint8Array(32).fill(0),
    encodeNsec: () => "nsec1test",
    validateAndDecodeKey: (k: string) => k === "nsec1valid" ? new Uint8Array(32).fill(1) : null,
    injectSigner: () => ({
        getPublicKey: async () => "pubkey123"
    }),
    isPrfSupported: mockIsPrfSupported,
    loadIdentity: () => null,
    saveIdentity: () => {},
    bytesToBase64: (b: Uint8Array) => "b64"
}));

describe("LoginModal", () => {
    beforeEach(() => {
        mockIsPrfSupported.mockClear();
        mockIsPrfSupported.mockResolvedValue(false);
    });

    afterEach(() => {
        cleanup();
    });

    test("renders landing state", () => {
        render(<LoginModal isOpen={true} onSuccess={() => {}} />);
        expect(screen.getByText(/Access Mirage/i)).toBeDefined();
        expect(screen.getByText(/Use Secret Key/i)).toBeDefined();
    });

    test("switches to manual entry", async () => {
        render(<LoginModal isOpen={true} onSuccess={() => {}} />);
        fireEvent.click(screen.getByText(/Use Secret Key/i));
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/nsec1.../i)).toBeDefined();
        });
    });

    test("shows error on invalid nsec", async () => {
        render(<LoginModal isOpen={true} onSuccess={() => {}} />);
        fireEvent.click(screen.getByText(/Use Secret Key/i));
        
        await waitFor(() => screen.getByPlaceholderText(/nsec1.../i));
        const input = screen.getByPlaceholderText(/nsec1.../i);
        fireEvent.change(input, { target: { value: 'invalid' } });
        fireEvent.click(screen.getByText(/Continue/i));

        await waitFor(() => {
            expect(screen.getByText(/Invalid secret key/i)).toBeDefined();
        });
    });

    test("calls onSuccess on valid nsec", async () => {
        let successPubkey = '';
        render(<LoginModal isOpen={true} onSuccess={(pk) => successPubkey = pk} />);
        fireEvent.click(screen.getByText(/Use Secret Key/i));
        
        await waitFor(() => screen.getByPlaceholderText(/nsec1.../i));
        const input = screen.getByPlaceholderText(/nsec1.../i);
        fireEvent.change(input, { target: { value: 'nsec1valid' } });
        fireEvent.click(screen.getByText(/Continue/i));

                await waitFor(() => {

                    expect(successPubkey).toBe("pubkey123");

                });

            });

        

    test("shows biometric setup when PRF is supported", async () => {
        // ... (existing test)
    });

    test("disables continue button while PRF check is loading", async () => {
        // Mock infinite loading
        mockIsPrfSupported.mockImplementation(() => new Promise(() => {}));
        render(<LoginModal isOpen={true} onSuccess={() => {}} />);
        
        fireEvent.click(screen.getByText(/Use Secret Key/i));
        
        // Wait for the manual step to appear
        const button = await screen.findByText(/Checking Security.../i);
        expect(button).toBeDefined();
        expect(button.closest('button')).toHaveProperty('disabled', true);
    });
});


        