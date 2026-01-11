export type Params = Record<string, string>;

/**
 * Matches a URL path against a pattern with parameters.
 * Pattern example: "/mirage/v1/spaces/:id"
 * Path example: "/mirage/v1/spaces/123"
 * Returns: { id: "123" } or null if no match.
 */
export function matchRoute(pattern: string, path: string): Params | null {
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) {
        return null;
    }

    const params: Params = {};

    for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathPart = pathParts[i];

        if (patternPart.startsWith(":")) {
            const paramName = patternPart.slice(1);
            if (!pathPart) return null; // Empty params not allowed? Usually URL split handles this.
            params[paramName] = decodeURIComponent(pathPart);
        } else if (patternPart !== pathPart) {
            return null;
        }
    }

    return params;
}
