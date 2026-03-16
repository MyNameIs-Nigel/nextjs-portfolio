import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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
  title: "Nigel Smith — Photographer",
  description:
    "Portfolio of Nigel Smith — photographer and videographer crafting bold visual narratives for the creative industry.",
  openGraph: {
    title: "Nigel Smith — Visual Storyteller",
    description:
      "Photographer crafting bold visual narratives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}
        <Analytics />
      </body>
    </html>
  );
}
