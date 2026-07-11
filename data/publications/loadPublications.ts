import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { createLegacyPublicationsData } from "./legacy";
import type { Paper, Patent, PublicationsData } from "./schema";

const paperTypes = new Set(["journal", "conference", "book-chapter"]);
const statuses = new Set(["verified", "pending"]);
const paperSources = new Set(["openalex", "manual", "legacy"]);

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isPaper(value: unknown): value is Paper {
  if (!value || typeof value !== "object") return false;
  const paper = value as Record<string, unknown>;
  return (
    typeof paper.id === "string" &&
    typeof paper.title === "string" &&
    Array.isArray(paper.authors) && paper.authors.every((author) => typeof author === "string") &&
    (typeof paper.year === "number" || paper.year === null) &&
    isStringOrNull(paper.venue) &&
    isStringOrNull(paper.doi) &&
    isStringOrNull(paper.url) &&
    paperTypes.has(paper.type as string) &&
    statuses.has(paper.status as string) &&
    paperSources.has(paper.source as string) &&
    (paper.raw === undefined || typeof paper.raw === "string")
  );
}

function isPatent(value: unknown): value is Patent {
  if (!value || typeof value !== "object") return false;
  const patent = value as Record<string, unknown>;
  return (
    typeof patent.id === "string" &&
    typeof patent.title === "string" &&
    Array.isArray(patent.inventors) && patent.inventors.every((inventor) => typeof inventor === "string") &&
    (typeof patent.year === "number" || patent.year === null) &&
    isStringOrNull(patent.number) &&
    (patent.country === "domestic" || patent.country === "international") &&
    (patent.raw === undefined || typeof patent.raw === "string")
  );
}

export function isPublicationsData(value: unknown): value is PublicationsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.updatedAt === "string" &&
    !Number.isNaN(Date.parse(data.updatedAt)) &&
    Array.isArray(data.papers) && data.papers.every(isPaper) &&
    Array.isArray(data.patents) && data.patents.every(isPatent)
  );
}

/**
 * Reads the generated store. A malformed or unavailable JSON file intentionally
 * degrades to the legacy display data so publication pages keep rendering.
 */
export function loadPublications(): PublicationsData {
  try {
    const file = path.join(process.cwd(), "data", "publications", "publications.json");
    const value: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (isPublicationsData(value)) return value;
    console.error("Invalid publications.json; using legacy publications fallback.");
  } catch (error) {
    console.error("Could not load publications.json; using legacy publications fallback.", error);
  }

  return createLegacyPublicationsData();
}
