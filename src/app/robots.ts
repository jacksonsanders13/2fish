import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // private or per-person pages
        disallow: ["/dashboard", "/messages", "/settings", "/notifications", "/admin", "/onboarding", "/api/", "/auth/", "/u/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
