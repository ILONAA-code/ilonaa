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
    "A privacy-first AI replacement risk assessment with profession-based context and future-of-work interpretation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI replacement risk assessment",
    "Profession-based risk interpretation",
    "RIASEC career type profile",
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
  name: `${SITE_NAME} AI Replacement Risk Assessment`,
  description:
    "An executive-grade AI replacement risk assessment with profession context and human-factor interpretation.",
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
