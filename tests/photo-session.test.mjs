import test from "node:test";
import assert from "node:assert/strict";
import { adminPassword, createSession, validSession, passwordMatches, SESSION_SECONDS } from "../src/lib/photo-session.ts";

const password = "test-only-owner-password-1234567890";
const now = 1_800_000_000_000;

test("owner sessions expire and cannot be forged or used after password rotation", () => {
  const token = createSession(password, now);
  assert.equal(validSession(token, password, now), true);
  assert.equal(validSession(token, password, now + SESSION_SECONDS * 1000), false);
  assert.equal(validSession(token, `${password}-rotated`, now), false);
  assert.equal(validSession(token.replace(/.$/, token.endsWith("0") ? "1" : "0"), password, now), false);
  assert.equal(validSession(undefined, password, now), false);
  assert.equal(validSession("99999999999.invalid.signature", password, now), false);
});

test("password comparison handles mismatched lengths without throwing", () => {
  assert.equal(passwordMatches(password, password), true);
  assert.equal(passwordMatches("", password), false);
  assert.equal(passwordMatches(`${password}x`, password), false);
});

test("the uploader stays disabled until a long random password is configured", () => {
  const previous = process.env.PHOTO_ADMIN_PASSWORD;
  try {
    delete process.env.PHOTO_ADMIN_PASSWORD;
    assert.equal(adminPassword(), null);
    process.env.PHOTO_ADMIN_PASSWORD = "x".repeat(31);
    assert.equal(adminPassword(), null, "short passwords are refused");
    process.env.PHOTO_ADMIN_PASSWORD = password;
    assert.equal(adminPassword(), password);
  } finally {
    if (previous === undefined) delete process.env.PHOTO_ADMIN_PASSWORD;
    else process.env.PHOTO_ADMIN_PASSWORD = previous;
  }
});
