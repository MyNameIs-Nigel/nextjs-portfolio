import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { absoluteUrl, jsonLd, siteDescription, siteOpenGraph, siteTitle, siteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  authors: [{ name: "Nigel Smith", url: siteUrl }],
  creator: "Nigel Smith",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: siteOpenGraph,
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: [absoluteUrl("/opengraph-image.jpg")] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // globals.css sets `scroll-behavior: smooth` for in-page anchors. Next 16 no longer
    // disables it during route changes unless this attribute is present, which otherwise
    // leaves new pages scrolled to the bottom.
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[200] rounded-lg bg-white px-5 py-3 text-foreground shadow-lg focus:not-sr-only">Skip to content</a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
          "@context": "https://schema.org", "@type": "Person", "@id": absoluteUrl("/#nigel-smith"),
          name: "Nigel Smith", url: siteUrl, image: absoluteUrl("/profile.jpg"), jobTitle: "Photographer",
          homeLocation: { "@type": "Place", name: "Monroe, Georgia" },
        }) }} />
        <Analytics />
      </body>
    </html>
  );
}
