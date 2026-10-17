import test from "node:test";
import assert from "node:assert/strict";
import { CONTACT_LIMITS, buildDiscordPayload, parseContactMessage } from "../src/lib/contact.ts";
import { POST } from "../src/app/api/contact/route.ts";

const form = { name: " Ada Lovelace ", email: " ada@example.com ", phone: "", project: "portrait", message: " Senior photos in May? " };

function contact(body, { contentType = "application/json" } = {}) {
  return POST(new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));
}

test("contact submissions need a name, a message, and an email or phone number", () => {
  assert.deepEqual(parseContactMessage(form), { name: "Ada Lovelace", email: "ada@example.com", phone: "", project: "portrait", message: "Senior photos in May?" });
  assert.equal(parseContactMessage({ ...form, email: "", phone: " 555-0100 " }).phone, "555-0100");
  assert.throws(() => parseContactMessage({ ...form, name: "  " }), /Missing required fields/);
  assert.throws(() => parseContactMessage({ ...form, message: 42 }), /Missing required fields/);
  assert.throws(() => parseContactMessage({ ...form, email: " ", phone: undefined }), /email address or phone number/);
});

test("every field is clamped to what a Discord embed accepts", () => {
  const long = Object.fromEntries(Object.keys(CONTACT_LIMITS).map((key) => [key, "x".repeat(5000)]));
  const parsed = parseContactMessage(long);
  for (const [key, limit] of Object.entries(CONTACT_LIMITS)) {
    assert.equal(parsed[key].length, limit, key);
    assert.ok(limit <= 1024, `${key} must fit in an embed field`);
  }
});

test("the Discord message never pings anyone and labels known project types", () => {
  const now = new Date("2026-10-17T12:00:00Z");
  const payload = buildDiscordPayload(parseContactMessage({ ...form, message: "@everyone hi" }), now);
  assert.deepEqual(payload.allowed_mentions, { parse: [] });
  const [embed] = payload.embeds;
  assert.equal(embed.timestamp, now.toISOString());
  assert.equal(embed.author.url, "https://ndsironwood.com/");
  assert.deepEqual(embed.fields.map((field) => field.name), ["Contact Name", "Email", "Project Type", "Message"]);
  assert.equal(embed.fields.find((field) => field.name === "Project Type").value, "Portrait Session");
  assert.equal(buildDiscordPayload({ ...parseContactMessage(form), project: "Wedding" }).embeds[0].fields[2].value, "Wedding");
  assert.equal(buildDiscordPayload({ ...parseContactMessage(form), project: "" }).embeds[0].fields[2].value, "*none specified*");
  for (const field of embed.fields) assert.ok(field.value.length > 0, `${field.name} must not be empty`);
});

test("the contact API rejects malformed requests before contacting Discord", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  process.env.DISCORD_WEBHOOK = "https://discord.example/webhook";
  for (const [response, error] of [
    [await contact("{not json"), "Malformed request body."],
    [await contact(["array"]), "Malformed request body."],
    [await contact(form, { contentType: "text/plain" }), "Malformed request body."],
    [await contact({ ...form, message: "x".repeat(9000) }), "Malformed request body."],
    [await contact({ ...form, name: "" }), "Missing required fields."],
    [await contact({ ...form, email: "", phone: "" }), "Please provide an email address or phone number."],
  ]) {
    assert.equal(response.status, 400);
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.deepEqual(await response.json(), { ok: false, error });
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("the contact API delivers to the webhook and reports delivery failures", async (t) => {
  delete process.env.DISCORD_WEBHOOK;
  assert.equal((await contact(form)).status, 500, "an unconfigured webhook is a server error");

  process.env.DISCORD_WEBHOOK = "https://discord.example/webhook";
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  const delivered = await contact(form);
  assert.equal(delivered.status, 200);
  assert.deepEqual(await delivered.json(), { ok: true });
  const [url, init] = fetch.mock.calls[0].arguments;
  assert.equal(url, "https://discord.example/webhook");
  assert.equal(JSON.parse(init.body).embeds[0].fields.at(-1).value, "Senior photos in May?");

  fetch.mock.mockImplementation(async () => new Response("rate limited", { status: 429 }));
  assert.equal((await contact(form)).status, 502);
  fetch.mock.mockImplementation(async () => { throw new TypeError("fetch failed"); });
  const offline = await contact(form);
  assert.equal(offline.status, 502);
  assert.deepEqual(await offline.json(), { ok: false, error: "The message could not be delivered." });
});
