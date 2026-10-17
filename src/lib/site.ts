export const siteUrl = (process.env.SITE_URL || "https://ndsironwood.com").replace(/\/$/, "");
export const siteTitle = "Nigel Smith — Photographer";
export const siteDescription =
  "Photography by Nigel Smith in Monroe, Georgia. Explore portraits, automotive photography, film, and an ongoing photo journal.";
export const siteOpenGraph = {
  title: siteTitle,
  description: siteDescription,
  siteName: "Nigel Smith Photography",
  locale: "en_US",
  type: "website",
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
