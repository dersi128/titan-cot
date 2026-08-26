import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/sortiment",
    "/aktuell",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/cs",
    "/cs/sortiment",
    "/cs/aktuell",
    "/cs/kontakt",
    "/cs/impressum",
    "/cs/datenschutz",
  ];
  return paths.map((path) => ({
    url: `${site.productionUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" || path === "/cs" ? 1 : 0.7,
  }));
}
