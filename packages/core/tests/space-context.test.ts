import { describe, test, expect, mock, beforeEach } from "bun:test";
import { 
    getSpaceContext, 
    getSpaceStore, 
    type SpaceRouteContext 
} from "../src/engine/routes/spaces";
import { RelayPool } from "../src/engine/relay-pool";

describe("Space Context", () => {
    let ctx: SpaceRouteContext;
    
    beforeEach(() => {
        ctx = {
            pool: {} as RelayPool,
            requestSign: mock(async (e: any) => e),
            requestEncrypt: mock(async (_: string, p: string) => p),
            requestDecrypt: mock(async (_: string, c: string) => c),
            currentPubkey: 'test_pubkey',
            appOrigin: 'test_app'
        };
    });

    test("GET /space returns standalone if no context", async () => {
        const res = await getSpaceContext(ctx);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: null, standalone: true });
    });

    test("GET /space returns context if set", async () => {
        ctx.currentSpace = { id: 's1', name: 'Work' };
        const res = await getSpaceContext(ctx);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 's1', name: 'Work' });
    });
});
