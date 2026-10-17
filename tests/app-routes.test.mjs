import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function routeFiles(directory, segments = []) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) files.push(...await routeFiles(path.join(directory, entry.name), [...segments, entry.name]));
    else if (/^(page|route)\.(tsx?|jsx?)$/.test(entry.name)) files.push([...segments, entry.name].join("/"));
  }
  return files;
}

test("no pages or route handlers are hidden inside private `_folders`", async () => {
  const files = await routeFiles(path.resolve("src/app"));
  assert.deepEqual(files.filter((file) => file.split("/").some((segment) => segment.startsWith("_"))), []);
  assert.ok(files.includes("%5Fselfcheck/route.ts"), "/_selfcheck is served from a `%5Fselfcheck` folder");
});

function setEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function withEnv(values, run) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  setEnv(values);
  return Promise.resolve(run()).finally(() => setEnv(previous));
}

// `%5F` is a literal folder name; a file URL keeps it from being decoded to `_`.
const selfcheckRoute = () => import(pathToFileURL(path.resolve("src/app/%5Fselfcheck/route.ts")).href);

async function selfcheck(authorization) {
  const { GET } = await selfcheckRoute();
  return GET(new Request("https://example.test/_selfcheck", authorization ? { headers: { authorization } } : {}));
}

test("/_selfcheck reports health publicly without leaking runtime details", () => withEnv({ SELFCHECK_TOKEN: "secret-token", VERCEL_GIT_COMMIT_SHA: undefined, GIT_COMMIT_SHA: undefined }, async () => {
  for (const authorization of [undefined, "Bearer wrong-token", "Bearer secret-token-but-longer", "Bearer "]) {
    const response = await selfcheck(authorization);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control"), /no-store/);
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ["service", "status", "timestamp", "version"]);
    assert.equal(body.status, "ok");
    assert.equal(body.version, "dev");
    assert.equal(new Date(body.timestamp).toISOString(), body.timestamp);
  }
}));

test("/_selfcheck adds runtime details for the configured bearer token only", async () => {
  await withEnv({ SELFCHECK_TOKEN: "secret-token", VERCEL_GIT_COMMIT_SHA: "0123456789abcdef", VERCEL_ENV: "preview" }, async () => {
    const body = await (await selfcheck("bearer secret-token")).json();
    assert.equal(body.version, "0123456");
    assert.equal(body.deployment.commit, "0123456789abcdef");
    assert.equal(body.deployment.environment, "preview");
    assert.equal(body.runtime.node, process.version);
    assert.ok(Number.isInteger(body.memory.rss_mb) && Number.isInteger(body.uptime_seconds));
  });
  await withEnv({ SELFCHECK_TOKEN: undefined }, async () => {
    assert.equal("memory" in await (await selfcheck("Bearer secret-token")).json(), false, "no token configured means no private details");
  });
});
