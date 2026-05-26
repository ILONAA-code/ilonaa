import type { Metadata } from "next";

const siteName = "ILONAA";

const defaultTitle = "ILONAA — Structured clarity for important decisions";
const defaultDescription =
  "AI-assisted career risk analysis to help you understand how resilient your career may be in the age of artificial intelligence.";

const openGraphTitle = "ILONAA — Understand Your AI Career Risk";
const openGraphDescription =
  "AI-assisted analysis designed to help you understand how resilient your career may be in the age of artificial intelligence.";

export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL("http://localhost:3000");
}

export const rootMetadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: `%s — ${siteName}`,
  },
  description: defaultDescription,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    siteName,
    title: openGraphTitle,
    description: openGraphDescription,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteName} — Structured clarity for important decisions`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: openGraphTitle,
    description: openGraphDescription,
    images: ["/og-image.png"],
  },
};
