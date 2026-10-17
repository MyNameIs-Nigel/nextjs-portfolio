import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Lets node:test load app modules the way Next.js resolves them: the `@/`
// path alias, extensionless imports, and JSON without import attributes.
const src = new URL("../src/", import.meta.url);
const hasExtension = /\.(m?[jt]s|json)$/;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) specifier = new URL(specifier.slice(2), src).href;
    if (/^(\.|file:)/.test(specifier) && !hasExtension.test(specifier)) {
      const url = new URL(specifier, context.parentURL);
      for (const extension of [".ts", "/index.ts"]) {
        if (existsSync(fileURLToPath(`${url.href}${extension}`))) return nextResolve(`${url.href}${extension}`, context);
      }
    }
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      // Packages without an exports map (e.g. `next/headers`) need the file extension in ESM.
      if (error?.code !== "ERR_MODULE_NOT_FOUND" || hasExtension.test(specifier)) throw error;
      return nextResolve(`${specifier}.js`, context);
    }
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("file:") || url.includes("/node_modules/")) return nextLoad(url, context);
    if (url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    }
    // App sources are ES modules; saying so skips Node's CommonJS detection pass.
    return nextLoad(url, url.endsWith(".ts") ? { ...context, format: "module-typescript" } : context);
  },
});
