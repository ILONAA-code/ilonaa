import type { Metadata } from "next";

export const SITE_NAME = "ILONAA";

export const SITE_TAGLINE =
  "Privacy-first AI career resilience assessment and automation risk reflection";

const homeTitle = "ILONAA | AI Career Resilience Assessment";
const homeDescription =
  "ILONAA is a privacy-first AI career resilience assessment. Understand your automation risk, professional strengths, and future-of-work positioning—in calm, executive clarity.";

const openGraphTitle = "ILONAA — AI Career Risk & Resilience Reflection";
const openGraphDescription =
  "A privacy-first AI career assessment for automation risk, resilience, and future-of-work clarity—without accounts, resumes, or fear-driven scoring.";

const sharedKeywords = [
  "AI career resilience assessment",
  "AI career risk analysis",
  "career automation risk",
  "AI job risk assessment",
  "future of work assessment",
  "AI career analysis",
  "career resilience",
  "professional AI adaptation",
];

export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL("http://localhost:3000");
}

function absoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}

function sharedOpenGraph(path = "/"): Metadata["openGraph"] {
  return {
    siteName: SITE_NAME,
    title: openGraphTitle,
    description: openGraphDescription,
    type: "website",
    locale: "en_US",
    url: absoluteUrl(path),
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ILONAA — AI career resilience assessment and automation risk reflection",
      },
    ],
  };
}

function sharedTwitter(): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: openGraphTitle,
    description: openGraphDescription,
    images: ["/og-image.png"],
  };
}

export const rootMetadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: SITE_NAME,
  title: {
    default: homeTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: homeDescription,
  keywords: sharedKeywords,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Career Development",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
  openGraph: sharedOpenGraph("/"),
  twitter: sharedTwitter(),
};

export const homeMetadata: Metadata = {
  ...rootMetadata,
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...sharedOpenGraph("/"),
    title: openGraphTitle,
    description: openGraphDescription,
    url: absoluteUrl("/"),
  },
};

export const assessmentMetadata: Metadata = {
  title: "AI Career Risk Assessment",
  description:
    "Take ILONAA’s privacy-first AI career assessment—10 reflective questions on automation risk, resilience, and future-of-work positioning.",
  alternates: {
    canonical: "/assessment",
  },
  openGraph: {
    ...sharedOpenGraph("/assessment"),
    title: "ILONAA — AI Career Risk Assessment",
    description:
      "Ten thoughtful questions to understand your AI exposure, career resilience, and professional positioning.",
    url: absoluteUrl("/assessment"),
  },
  twitter: {
    ...sharedTwitter(),
    title: "ILONAA — AI Career Risk Assessment",
    description:
      "Ten thoughtful questions to understand your AI exposure, career resilience, and professional positioning.",
  },
};

export const resultsMetadata: Metadata = {
  title: "Your AI Career Resilience Profile",
  description:
    "Your personalized ILONAA results—RIASEC career type, ILONAA AI Risk Index, automation risk positioning, and resilience insight.",
  alternates: {
    canonical: "/assessment/results",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    ...sharedOpenGraph("/assessment/results"),
    title: "ILONAA — Your AI Career Resilience Profile",
    description:
      "Personalized RIASEC career type, ILONAA AI Risk Index, and future-of-work reflection from your assessment.",
    url: absoluteUrl("/assessment/results"),
  },
};

export const methodologyMetadata: Metadata = {
  title: "How ILONAA Works | RIASEC Career Type and AI Risk Index",
  description:
    "Learn how ILONAA combines the established RIASEC occupational framework with a proprietary AI Risk Index to assess AI exposure, replacement risk and career resilience.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    ...sharedOpenGraph("/methodology"),
    title: "How ILONAA Works | RIASEC Career Type and AI Risk Index",
    description:
      "Learn how ILONAA combines RIASEC occupational identity with a proprietary AI Risk Index for exposure, replacement risk, and career resilience.",
    url: absoluteUrl("/methodology"),
  },
  twitter: {
    ...sharedTwitter(),
    title: "How ILONAA Works | RIASEC Career Type and AI Risk Index",
    description:
      "Learn how ILONAA combines RIASEC occupational identity with a proprietary AI Risk Index for exposure, replacement risk, and career resilience.",
  },
};
