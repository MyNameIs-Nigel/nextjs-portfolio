import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "portfolio_photo_session";
export const SESSION_SECONDS = 12 * 60 * 60;

export function adminPassword() {
  const password = process.env.PHOTO_ADMIN_PASSWORD;
  return password && password.length >= 32 ? password : null;
}

export function passwordMatches(input: string, password: string) {
  return timingSafeEqual(createHash("sha256").update(input).digest(), createHash("sha256").update(password).digest());
}

function signature(payload: string, password: string) {
  return createHmac("sha256", password).update(`photo-session:${payload}`).digest("hex");
}

export function createSession(password: string, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload, password)}`;
}

export function validSession(token: string | undefined, password: string, now = Date.now()) {
  if (!token || !/^\d+\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expiration, nonce, signed] = token.split(".");
  const remaining = Number(expiration) - Math.floor(now / 1000);
  if (remaining <= 0 || remaining > SESSION_SECONDS) return false;
  return timingSafeEqual(Buffer.from(signed, "hex"), Buffer.from(signature(`${expiration}.${nonce}`, password), "hex"));
}
