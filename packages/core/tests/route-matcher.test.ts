import { describe, expect, it } from "bun:test";
import { matchRoute } from "../src/engine/route-matcher";

describe("Route Matcher", () => {
    it("matches exact static paths", () => {
        expect(matchRoute("/mirage/v1/ready", "/mirage/v1/ready")).toEqual({});
        expect(matchRoute("/mirage/v1/ready", "/mirage/v1/not-ready")).toBeNull();
    });

    it("extracts parameters", () => {
        const pattern = "/mirage/v1/spaces/:id";
        expect(matchRoute(pattern, "/mirage/v1/spaces/123")).toEqual({ id: "123" });
        expect(matchRoute(pattern, "/mirage/v1/spaces/abc-def")).toEqual({ id: "abc-def" });
    });

    it("extracts multiple parameters", () => {
        const pattern = "/mirage/v1/spaces/:spaceId/store/:key";
        expect(matchRoute(pattern, "/mirage/v1/spaces/123/store/myKey")).toEqual({
            spaceId: "123",
            key: "myKey",
        });
    });

    it("decodes parameters", () => {
        const pattern = "/mirage/v1/spaces/:id";
        expect(matchRoute(pattern, "/mirage/v1/spaces/my%20space")).toEqual({
            id: "my space",
        });
    });

    it("fails on segment length mismatch", () => {
        expect(matchRoute("/a/b", "/a/b/c")).toBeNull();
        expect(matchRoute("/a/b/c", "/a/b")).toBeNull();
    });

    it("fails on static segment mismatch", () => {
        expect(matchRoute("/mirage/v1/users/:id", "/mirage/v1/spaces/123")).toBeNull();
    });
});
