const MAX_JSON_BYTES = 8192;

/** A JSON API response that is never cached or indexed. */
export function privateJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

/** True only for requests sent by this site's own pages. Browsers always send Origin on POST and DELETE. */
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

/** Reads a small JSON object body, rejecting other content types, oversized bodies, and non-objects. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Expected JSON.");
  const body = await request.text();
  if (body.length > MAX_JSON_BYTES) throw new Error("Request is too large.");
  const value = JSON.parse(body);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request.");
  return value;
}
