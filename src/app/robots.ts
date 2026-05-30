import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site/metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().toString();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/assessment/results", "/debug"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
