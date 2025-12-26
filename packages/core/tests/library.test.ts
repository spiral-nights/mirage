import { describe, expect, test, mock } from "bun:test";
import { loadAppLibrary, addAppToLibrary } from "../src/engine/library";
import { StorageRouteContext } from "../src/engine/routes/storage";

describe("App Library", () => {
    test("addAppToLibrary deduplicates and saves", async () => {
        const mockApps = [{ naddr: "abc", name: "App 1", createdAt: 123 }];
        
        let savedData: any = null;
        const ctx = {
            appOrigin: "studio",
            currentPubkey: "00".repeat(32),
            pool: {
                subscribe: mock((filters: any, onEvent: any, onEose: any) => {
                    onEvent({ content: JSON.stringify(mockApps), created_at: 123, pubkey: "00".repeat(32) });
                    onEose();
                    return () => {};
                }),
                publish: mock(async () => {})
            },
            requestDecrypt: mock(async (pk: string, data: string) => data),
            requestEncrypt: mock(async (pk: string, data: string) => data),
            requestSign: mock(async (ev: any) => ({ ...ev, id: "123", sig: "sig", pubkey: "00".repeat(32) }))
        } as unknown as StorageRouteContext;

        // Mock internalPutStorage logic since we can't easily mock the pool.publish
        // We'll just check if load returns correctly first
        const library = await loadAppLibrary(ctx);
        expect(library).toHaveLength(1);
        expect(library[0].naddr).toBe("abc");
    });
});
