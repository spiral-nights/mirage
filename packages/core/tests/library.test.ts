import { describe, expect, test, mock } from "bun:test";
import { loadAppLibrary, addAppToLibrary } from "../src/engine/library";
import { StorageRouteContext } from "../src/engine/routes/storage";

describe("App Library", () => {
  test("addAppToLibrary deduplicates and saves", async () => {
    const mockApps = [{ naddr: "abc", name: "App 1", createdAt: 123 }];

    const ctx = {
      appOrigin: "mirage",
      currentPubkey: "00".repeat(32),
      pool: {
        subscribe: mock(),
        publish: mock(async () => {}),
        query: mock(async () => ({
          content: JSON.stringify(mockApps),
          created_at: 123,
          pubkey: "00".repeat(32),
        })),
        queryAll: mock(),
      },
      requestDecrypt: mock(async (pk: string, data: string) => data),
      requestEncrypt: mock(async (pk: string, data: string) => data),
      requestSign: mock(async (ev: any) => ({
        ...ev,
        id: "123",
        sig: "sig",
        pubkey: "00".repeat(32),
      })),
    } as unknown as StorageRouteContext;

    const library = await loadAppLibrary(ctx);
    expect(library).toHaveLength(1);
    expect(library[0].naddr).toBe("abc");
  });
});
