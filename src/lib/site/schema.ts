import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site/metadata";

const siteUrl = getSiteUrl().toString();

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: SITE_NAME,
  url: siteUrl,
  description: SITE_TAGLINE,
  logo: `${siteUrl}/icon-512.png`,
  sameAs: [] as string[],
};

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: SITE_NAME,
  url: siteUrl,
  description: SITE_TAGLINE,
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
  inLanguage: "en-US",
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#application`,
  name: SITE_NAME,
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser",
  description:
    "A privacy-first AI career resilience assessment for automation risk analysis, professional strengths, and future-of-work reflection.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI career resilience assessment",
    "Career automation risk reflection",
    "Personal career archetype profile",
    "Privacy-first design without accounts",
    "European-hosted infrastructure",
  ],
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
  isPartOf: {
    "@id": `${siteUrl}/#website`,
  },
};

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${siteUrl}/#product`,
  name: `${SITE_NAME} AI Career Resilience Assessment`,
  description:
    "An executive-grade AI career risk and resilience reflection—mapping automation exposure, human strengths, and future-of-work positioning.",
  brand: {
    "@type": "Brand",
    name: SITE_NAME,
  },
  category: "Career assessment software",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/assessment`,
  },
};

export const globalSchemaGraph = [
  organizationSchema,
  webSiteSchema,
  webApplicationSchema,
  productSchema,
];
