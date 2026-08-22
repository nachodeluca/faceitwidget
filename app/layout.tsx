import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SITE_METADATA, SOCIAL_IMAGE } from "@/lib/site-metadata";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit-loaded",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_METADATA.url),
  title: {
    default: SITE_METADATA.title,
    template: `%s | ${SITE_METADATA.name}`,
  },
  description: SITE_METADATA.description,
  applicationName: SITE_METADATA.name,
  category: "gaming",
  keywords: ["FACEIT Widget", "FACEIT widget for OBS", "FACEIT CS2 overlay", "live FACEIT stats"],
  authors: [{ name: "Nacho", url: "https://github.com/nachodeluca" }],
  creator: "Nacho",
  publisher: SITE_METADATA.name,
  openGraph: {
    type: "website",
    siteName: SITE_METADATA.name,
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: SITE_METADATA.url,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: ["/opengraph-image"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-screen text-on-surface" suppressHydrationWarning>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
