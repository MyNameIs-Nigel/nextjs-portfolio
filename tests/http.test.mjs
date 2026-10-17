import test from "node:test";
import assert from "node:assert/strict";
import { privateJson, readJson, sameOrigin } from "../src/lib/http.ts";

const post = (body, headers = {}) => new Request("https://ndsironwood.com/api/photos", { method: "POST", headers: { "content-type": "application/json", ...headers }, body });

test("API responses are never cached or indexed", async () => {
  const response = privateJson({ error: "nope" }, 418);
  assert.equal(response.status, 418);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.deepEqual(await response.json(), { error: "nope" });
  assert.equal(privateJson({ ok: true }).status, 200);
});

test("only requests from this site's own origin count as same-origin", () => {
  assert.equal(sameOrigin(post("{}", { origin: "https://ndsironwood.com" })), true);
  assert.equal(sameOrigin(post("{}", { origin: "https://attacker.example" })), false);
  assert.equal(sameOrigin(post("{}", { origin: "http://ndsironwood.com" })), false);
  assert.equal(sameOrigin(post("{}")), false, "a missing Origin header is rejected");
});

test("JSON bodies must be small objects sent as application/json", async () => {
  assert.deepEqual(await readJson(post('{"id":"x"}', { "content-type": "application/json; charset=utf-8" })), { id: "x" });
  await assert.rejects(readJson(post("{}", { "content-type": "text/plain" })), /Expected JSON/);
  await assert.rejects(readJson(new Request("https://ndsironwood.com/", { method: "POST", body: "{}" })), /Expected JSON/);
  await assert.rejects(readJson(post(JSON.stringify({ text: "x".repeat(8192) }))), /too large/);
  await assert.rejects(readJson(post("{oops")), SyntaxError);
  for (const body of ["null", "[]", '"text"', "7"]) await assert.rejects(readJson(post(body)), /Invalid request/, body);
});
