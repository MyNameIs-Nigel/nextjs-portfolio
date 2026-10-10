import { cookies } from "next/headers";
import { adminPassword, createSession, passwordMatches, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/photo-session";
import { privateJson, readJson, sameOrigin } from "@/lib/photo-auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid request origin." }, 403);
  const password = adminPassword();
  if (!password) return privateJson({ error: "The photo uploader has not been configured." }, 503);
  try {
    const input = await readJson(request);
    if (typeof input.password !== "string" || !passwordMatches(input.password, password)) {
      return privateJson({ error: "Incorrect password." }, 401);
    }
    (await cookies()).set(SESSION_COOKIE, createSession(password), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS,
    });
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "Invalid sign-in request." }, 400);
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid request origin." }, 403);
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0,
  });
  return privateJson({ ok: true });
}
