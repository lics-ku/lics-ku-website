import type { MetadataRoute } from "next";

import { RESEARCH_LIST } from "@data/research/ResearchList";
import { NOTIFICATION_LIST } from "@data/home/NotificationList";

const BASE_URL = "https://lics.korea.ac.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/research",
    "/publications",
    "/people",
    "/people/students",
    "/people/alumnis",
    "/contact",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const researchRoutes = RESEARCH_LIST.map((r) => ({
    url: `${BASE_URL}/research/${r.id}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const noticeRoutes = NOTIFICATION_LIST.map((n) => ({
    url: `${BASE_URL}/notices/${n.id}`,
    lastModified: new Date(n.createdAt),
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...researchRoutes, ...noticeRoutes];
}
