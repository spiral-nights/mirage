import { describe, expect, test } from "bun:test";
import { 
    createNewSecretKey, 
    encodeNsec, 
    decodeNsec, 
    validateAndDecodeKey, 
    getPublicKey 
} from "../src/auth";

describe("Auth Utilities", () => {
    test("generate and encode/decode nsec", () => {
        const sk = createNewSecretKey();
        expect(sk).toBeInstanceOf(Uint8Array);
        expect(sk.length).toBe(32);

        const nsec = encodeNsec(sk);
        expect(nsec).toStartWith("nsec1");

        const decoded = decodeNsec(nsec);
        expect(decoded).toEqual(sk);
    });

    test("validateAndDecodeKey handles nsec", () => {
        const sk = createNewSecretKey();
        const nsec = encodeNsec(sk);
        const validated = validateAndDecodeKey(nsec);
        expect(validated).toEqual(sk);
    });

    test("validateAndDecodeKey handles hex", () => {
        const hex = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        const validated = validateAndDecodeKey(hex);
        expect(validated).not.toBeNull();
        expect(validated![0]).toBe(0x00);
        expect(validated![31]).toBe(0x1f);
    });

    test("getPublicKey derives correctly", () => {
        const sk = createNewSecretKey();
        const pk = getPublicKey(sk);
        expect(pk).toHaveLength(64);
        expect(pk).toMatch(/^[0-9a-f]+$/);
    });
});
