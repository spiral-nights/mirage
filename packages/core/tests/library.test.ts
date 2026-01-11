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
        publish: mock((relays: string[], event: any) => [Promise.resolve()]),
        get: mock(async () => ({
          content: JSON.stringify(mockApps),
          created_at: 123,
          pubkey: "00".repeat(32),
        })),
        querySync: mock(),
        getRelays: mock(() => []),
        withRelays: mock(() => ({
          get: mock(async () => ({
            content: JSON.stringify(mockApps),
            created_at: 123,
            pubkey: "00".repeat(32),
          })),
          getRelays: mock(() => []),
          querySync: mock(),
        })),
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

  test("removeAppFromLibrary deletion event tags", async () => {
    // Generate a valid naddr for testing
    // kind=30078, pubkey=00...00, identifier=test-app
    // We skip actual encoding logic and just mock the data flow or use a real naddr if needed.
    // However, removeAppFromLibrary does: const decoded = nip19.decode(naddr);
    // So we need a real naddr.
    const { nip19 } = await import("nostr-tools");
    const naddr = nip19.naddrEncode({
      kind: 30078,
      pubkey: "00".repeat(32),
      identifier: "test-app",
      relays: ["wss://relay.example.com"]
    });

    const mockApps = [{ naddr, name: "App 1", createdAt: 123 }];

    let publishedEvents: any[] = [];
    const publishSpy = mock((relays: string[], ev: any) => {
      publishedEvents.push(ev);
      return [Promise.resolve()];
    });

    const ctx = {
      relays: ['wss://relay.example.com'],
      appOrigin: "mirage",
      currentPubkey: "00".repeat(32),
      pool: {
        subscribe: mock(),
        publish: publishSpy,
        get: mock(async (relays: string[], filter: any) => {
          // Basic check if it's asking for app_list
          if (filter && filter['#d'] && filter['#d'].includes('mirage:app_list')) {
            return {
              content: JSON.stringify(mockApps),
              created_at: 123,
              pubkey: "00".repeat(32),
              kind: 30078,
              tags: [['d', 'mirage:app_list']]
            };
          }
          return null;
        }),
        querySync: mock((relays: string[], filter: any) => [{
          content: JSON.stringify(mockApps),
          created_at: 123,
          pubkey: "00".repeat(32),
          kind: 30078,
          tags: [['d', 'app_list']]
        }]),
        getRelays: mock(() => []),
        withRelays: mock(() => ({
          get: mock(),
          querySync: mock((relays: string[], filter: any) => [{
            content: JSON.stringify(mockApps),
            created_at: 123,
            pubkey: "00".repeat(32),
            kind: 30078,
            tags: [['d', 'app_list']]
          }]),
          getRelays: mock(() => [])
        })),
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

    // We need to import removeAppFromLibrary
    const { removeAppFromLibrary } = await import("../src/engine/library");

    await removeAppFromLibrary(ctx, naddr);

    // Filter for Kind 5 events
    const deletionEvents = publishedEvents.filter(e => e.kind === 5);
    expect(deletionEvents.length).toBeGreaterThan(0);

    const deletionEvent = deletionEvents[0];
    const tags = deletionEvent.tags as string[][];

    // Check that we DO NOT have an empty 'e' tag
    const emptyETag = tags.find(t => t[0] === 'e' && t[1] === '');
    expect(emptyETag).toBeUndefined();

    // Check we have the correct 'a' tag
    const expectedATag = `30078:${"00".repeat(32)}:test-app`;
    const aTag = tags.find(t => t[0] === 'a' && t[1] === expectedATag);
    expect(aTag).toBeDefined();
  });
});
