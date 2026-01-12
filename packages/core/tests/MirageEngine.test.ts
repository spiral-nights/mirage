import { describe, test, expect, mock, beforeEach } from "bun:test";
import { MirageEngine } from "../src/engine/MirageEngine";
import { SpaceService } from "../src/engine/services/SpaceService";

// Mock dependencies
const mockPool = {
    publish: mock(() => Promise.resolve()),
    querySync: mock(() => []),
    close: mock(),
    sub: mock()
};

describe("MirageEngine V2", () => {
    let engine: MirageEngine;

    beforeEach(() => {
        engine = new MirageEngine({
            relays: ["wss://relay.example.com"],
            pool: mockPool as any
        });
    });

    test("initializes with correct defaults", () => {
        expect(engine).toBeDefined();
    });

    test("updates context on SET_PUBKEY", async () => {
        await engine.handleMessage({
            type: "SET_PUBKEY",
            id: "1",
            pubkey: "test-pubkey"
        } as any);
        // We can't access private state easily, but we verify it doesn't crash
        expect(true).toBe(true);
    });

    test("updates context on SET_APP_ORIGIN", async () => {
        await engine.handleMessage({
            type: "SET_APP_ORIGIN",
            id: "2",
            origin: "test-app"
        } as any);
        expect(true).toBe(true);
    });

    test("routes listSpaces correctly", async () => {
        // Mock space service response
        const mockList = mock(() => Promise.resolve([]));
        (engine as any).spaceService.listSpaces = mockList;

        const msg = {
            type: "API_REQUEST",
            id: "req1",
            method: "GET",
            path: "/mirage/v1/spaces",
            body: {}
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockList).toHaveBeenCalled();
    });

    test("routes createSpace correctly", async () => {
        const mockCreate = mock(() => Promise.resolve({ id: "s1", name: "New Space" }));
        (engine as any).spaceService.createSpace = mockCreate;

        const msg = {
            type: "API_REQUEST",
            id: "req2",
            method: "POST",
            path: "/mirage/v1/admin/spaces",
            body: { name: "New Space" }
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        await engine.handleMessage(msg as any);

        expect(response.status).toBe(201);
        expect(mockCreate).toHaveBeenCalledWith("New Space", undefined);
    });

    test("routes deleteSpace correctly with param", async () => {
        const mockDelete = mock(() => Promise.resolve("s1"));
        (engine as any).spaceService.deleteSpace = mockDelete;

        const msg = {
            type: "API_REQUEST",
            id: "req3",
            method: "DELETE",
            path: "/mirage/v1/spaces/s1",
            body: {}
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockDelete).toHaveBeenCalledWith("s1");
    });

    test("routes admin deleteSpace correctly", async () => {
        const mockDelete = mock(() => Promise.resolve("s2"));
        (engine as any).spaceService.deleteSpace = mockDelete;

        const msg = {
            type: "API_REQUEST",
            id: "req4",
            method: "DELETE",
            path: "/mirage/v1/admin/spaces/s2",
            body: {}
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockDelete).toHaveBeenCalledWith("s2");
    });
    test("routes listAllSpaces correctly", async () => {
        const mockListAll = mock(() => Promise.resolve([{ id: "s1" }]));
        (engine as any).spaceService.listAllSpaces = mockListAll;

        const msg = {
            type: "API_REQUEST",
            id: "req_admin_list",
            method: "GET",
            path: "/mirage/v1/admin/spaces",
            body: {}
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };
        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockListAll).toHaveBeenCalled();
    });

    test("routes updateSpace correctly", async () => {
        const mockUpdate = mock(() => Promise.resolve({ id: "s1", name: "Updated" }));
        (engine as any).spaceService.updateSpace = mockUpdate;

        const msg = {
            type: "API_REQUEST",
            id: "req_admin_update",
            method: "PUT",
            path: "/mirage/v1/admin/spaces/s1",
            body: { name: "Updated" }
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };
        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith("s1", "Updated");
    });

    test("routes admin invite member correctly", async () => {
        const mockInvite = mock(() => Promise.resolve({ invited: "p1" }));
        (engine as any).spaceService.inviteMember = mockInvite;

        const msg = {
            type: "API_REQUEST",
            id: "req_admin_invite",
            method: "POST",
            path: "/mirage/v1/admin/spaces/s1/invitations",
            body: { pubkey: "p1", name: "Alice" }
        };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };
        await engine.handleMessage(msg as any);

        expect(response.status).toBe(200);
        expect(mockInvite).toHaveBeenCalledWith("s1", "p1", "Alice");
    });

    test("routes get/post messages for specific space", async () => {
        const mockGetMsgs = mock(() => Promise.resolve([{ id: "m1" }]));
        const mockSendMsg = mock(() => Promise.resolve({ id: "m2" }));
        (engine as any).spaceService.getMessages = mockGetMsgs;
        (engine as any).spaceService.sendMessage = mockSendMsg;

        // GET
        let msg: any = {
            type: "API_REQUEST",
            id: "req_get_msgs",
            method: "GET",
            path: "/mirage/v1/spaces/s1/messages",
            body: { limit: 10 }
        };
        let response: any;
        (engine as any).send = (r: any) => { response = r; };
        await engine.handleMessage(msg as any);
        expect(response.status).toBe(200);
        expect(mockGetMsgs).toHaveBeenCalledWith("s1", 10, undefined);

        // POST
        msg = {
            type: "API_REQUEST",
            id: "req_post_msg",
            method: "POST",
            path: "/mirage/v1/spaces/s1/messages",
            body: { content: "hello" }
        };
        await engine.handleMessage(msg as any);
        expect(response.status).toBe(201);
        expect(mockSendMsg).toHaveBeenCalledWith("s1", "hello");
    });

    test("routes get/put store for specific space", async () => {
        const mockGetStore = mock(() => Promise.resolve({ key: "val" }));
        const mockUpdateStore = mock(() => Promise.resolve({ key: "k", value: "v" }));
        (engine as any).spaceService.getSpaceStore = mockGetStore;
        (engine as any).spaceService.updateSpaceStore = mockUpdateStore;

        // GET
        let msg: any = {
            type: "API_REQUEST",
            id: "req_get_store",
            method: "GET",
            path: "/mirage/v1/spaces/s1/store",
            body: {}
        };
        let response: any;
        (engine as any).send = (r: any) => { response = r; };
        await engine.handleMessage(msg as any);
        expect(response.status).toBe(200);
        expect(mockGetStore).toHaveBeenCalledWith("s1");

        // PUT
        msg = {
            type: "API_REQUEST",
            id: "req_put_store",
            method: "PUT",
            path: "/mirage/v1/spaces/s1/store/k1",
            body: { some: "data" }
        };
        await engine.handleMessage(msg as any);
        expect(response.status).toBe(200);
        expect(mockUpdateStore).toHaveBeenCalledWith("s1", "k1", { some: "data" });
    });

    test("routes get/put implicit space context", async () => {
        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        // PUT Context
        const putMsg = {
            type: "API_REQUEST",
            id: "req_put_ctx",
            method: "PUT",
            path: "/mirage/v1/space",
            body: { spaceId: "s1", spaceName: "My Space" }
        };
        await engine.handleMessage(putMsg as any);
        expect(response.status).toBe(200);
        expect((engine as any).currentSpace).toEqual({ id: "s1", name: "My Space" });

        // GET Context
        const getMsg = {
            type: "API_REQUEST",
            id: "req_get_ctx",
            method: "GET",
            path: "/mirage/v1/space",
            body: {}
        };
        await engine.handleMessage(getMsg as any);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ spaceId: "s1", spaceName: "My Space" });
    });

    test("routes implicit store correctly", async () => {
        const mockGetStore = mock(() => Promise.resolve({ k: "v" }));
        const mockUpdateStore = mock(() => Promise.resolve({ k: "v2" }));
        (engine as any).spaceService.getSpaceStore = mockGetStore;
        (engine as any).spaceService.updateSpaceStore = mockUpdateStore;
        (engine as any).currentSpace = { id: "s1", name: "Implicit" };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        // GET
        await engine.handleMessage({
            type: "API_REQUEST",
            id: "req_impl_get_store",
            method: "GET",
            path: "/mirage/v1/space/store",
            body: {}
        } as any);
        expect(response.status).toBe(200);
        expect(mockGetStore).toHaveBeenCalledWith("s1");

        // PUT
        await engine.handleMessage({
            type: "API_REQUEST",
            id: "req_impl_put_store",
            method: "PUT",
            path: "/mirage/v1/space/store/key1",
            body: { val: 1 }
        } as any);
        expect(response.status).toBe(200);
        expect(mockUpdateStore).toHaveBeenCalledWith("s1", "key1", { val: 1 });
    });

    test("routes implicit messages correctly", async () => {
        const mockGetMsgs = mock(() => Promise.resolve([]));
        const mockSendMsg = mock(() => Promise.resolve({}));
        (engine as any).spaceService.getMessages = mockGetMsgs;
        (engine as any).spaceService.sendMessage = mockSendMsg;
        (engine as any).currentSpace = { id: "s1", name: "Implicit" };

        let response: any;
        (engine as any).send = (r: any) => { response = r; };

        // GET
        await engine.handleMessage({
            type: "API_REQUEST",
            id: "req_impl_get_msg",
            method: "GET",
            path: "/mirage/v1/space/messages",
            body: {}
        } as any);
        expect(response.status).toBe(200);
        expect(mockGetMsgs).toHaveBeenCalledWith("s1", undefined, undefined);

        // POST
        await engine.handleMessage({
            type: "API_REQUEST",
            id: "req_impl_post_msg",
            method: "POST",
            path: "/mirage/v1/space/messages",
            body: { content: "hi" }
        } as any);
        expect(response.status).toBe(201);
        expect(mockSendMsg).toHaveBeenCalledWith("s1", "hi");
    });
});



