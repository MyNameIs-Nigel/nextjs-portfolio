import { cookies } from "next/headers";
import { adminPassword, SESSION_COOKIE, validSession } from "./photo-session";

export async function isPhotoAdmin() {
  const password = adminPassword();
  return !!password && validSession((await cookies()).get(SESSION_COOKIE)?.value, password);
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export function privateJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Expected JSON.");
  const body = await request.text();
  if (body.length > 8192) throw new Error("Request is too large.");
  const value = JSON.parse(body);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request.");
  return value;
}
