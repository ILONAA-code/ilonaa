import type { Metadata } from "next";

export const SITE_NAME = "ILONAA";

export const SITE_TAGLINE =
  "Privacy-first AI replacement risk assessment with profession-based context";

const homeTitle = "ILONAA | AI Career Resilience Assessment";
const homeDescription =
  "ILONAA is a privacy-first AI replacement risk assessment. Understand how replaceable your profession may be by AI, and what factors may protect it.";

const openGraphTitle = "ILONAA — AI Career Risk & Resilience Reflection";
const openGraphDescription =
  "A privacy-first AI replacement risk assessment with profession baseline context and focused calibration questions—without accounts or fear-driven scoring.";

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
    "Take ILONAA’s profession-based AI replacement risk assessment: profession selection plus 4 focused ILONAA questions.",
  alternates: {
    canonical: "/assessment",
  },
  openGraph: {
    ...sharedOpenGraph("/assessment"),
    title: "ILONAA — AI Career Risk Assessment",
    description:
      "Profession-based baseline plus 4 focused questions to estimate AI Replacement Risk and supporting career factors.",
    url: absoluteUrl("/assessment"),
  },
  twitter: {
    ...sharedTwitter(),
    title: "ILONAA — AI Career Risk Assessment",
    description:
      "Profession-based baseline plus 4 focused questions to estimate AI Replacement Risk and supporting career factors.",
  },
};

export const resultsMetadata: Metadata = {
  title: "Your AI Replacement Risk Result",
  description:
    "Your personalized ILONAA result: AI Replacement Risk with supporting human advantage factors and profession context.",
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
    title: "ILONAA — Your AI Replacement Risk Result",
    description:
      "AI Replacement Risk result with profession context, RIASEC orientation, and supporting risk interpretation.",
    url: absoluteUrl("/assessment/results"),
  },
};

export const methodologyMetadata: Metadata = {
  title: "How ILONAA Works | AI Replacement Risk Methodology",
  description:
    "Learn how ILONAA uses profession baseline context, O*NET-inspired structures, and RIASEC identity to estimate AI Replacement Risk.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    ...sharedOpenGraph("/methodology"),
    title: "How ILONAA Works | AI Replacement Risk Methodology",
    description:
      "See how ILONAA combines O*NET-inspired occupational structures and RIASEC identity to estimate AI Replacement Risk with supporting context.",
    url: absoluteUrl("/methodology"),
  },
  twitter: {
    ...sharedTwitter(),
    title: "How ILONAA Works | AI Replacement Risk Methodology",
    description:
      "See how ILONAA combines O*NET-inspired occupational structures and RIASEC identity to estimate AI Replacement Risk with supporting context.",
  },
};
