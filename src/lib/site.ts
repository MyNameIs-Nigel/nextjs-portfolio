export const siteUrl = (process.env.SITE_URL || "https://ndsironwood.com").replace(/\/$/, "");
export const siteName = "Nigel Smith";
export const siteDescription =
  "Photography by Nigel Smith in Monroe, Georgia. Explore portraits, automotive photography, film, and an ongoing photo journal.";

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
