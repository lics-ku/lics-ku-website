import {
  BOOK_CHAPTERS,
  JOURNAL_PAPERS,
} from "./publicationContent";
import { CONFERENCES } from "./conferences";
import { DOMESTIC_PATENTS, INTERNATIONAL_PATENTS } from "./patents";
import type { Paper, PaperType, Patent, PublicationsData } from "./schema";

const LEGACY_UPDATED_AT = "2026-07-11T00:00:00.000Z";

function clean(value: string): string {
  return value.replace(/\s+/g, " ").replace(/^,\s*|\s*,?$/g, "").trim();
}

function parseAuthors(value: string): string[] {
  return clean(value)
    .replace(/,?\s+and\s+/gi, ",")
    .split(",")
    .map(clean)
    .filter(Boolean);
}

function quotedTitle(raw: string): { authors: string[]; title: string; tail: string } | null {
  const opening = raw.search(/["“]/);
  if (opening < 0) return null;

  const closingMatch = /["”]/.exec(raw.slice(opening + 1));
  if (!closingMatch || closingMatch.index === undefined) return null;

  const closing = opening + 1 + closingMatch.index;
  const title = clean(raw.slice(opening + 1, closing));
  if (!title) return null;

  return {
    authors: parseAuthors(raw.slice(0, opening)),
    title,
    tail: raw.slice(closing + 1),
  };
}

function parseVenue(tail: string, type: PaperType): string | null {
  const text = clean(tail);
  if (!text) return null;

  if (type === "conference") {
    return clean(text.split(",")[0]) || null;
  }

  const venue = text.split(
    /,\s*(?:vol\.|no\.|pp\.|early access|to be published|\d{4}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?)/i,
  )[0];
  return clean(venue) || null;
}

function parseLegacyPaper(raw: string, type: PaperType, index: number): Paper {
  const parsed = quotedTitle(raw);
  const yearMatch = raw.match(/\b(?:19|20)\d{2}\b/g);
  const year = yearMatch ? Number(yearMatch[yearMatch.length - 1]) : null;

  if (!parsed) {
    return {
      id: `legacy:${type}-${String(index + 1).padStart(3, "0")}`,
      type,
      title: raw,
      authors: [],
      year,
      venue: null,
      doi: null,
      url: null,
      status: "verified",
      source: "legacy",
      raw,
    };
  }

  return {
    id: `legacy:${type}-${String(index + 1).padStart(3, "0")}`,
    type,
    title: parsed.title,
    authors: parsed.authors,
    year,
    venue: parseVenue(parsed.tail, type),
    doi: null,
    url: null,
    status: "verified",
    source: "legacy",
    raw,
  };
}

function parseLegacyPatent(raw: string, country: Patent["country"], index: number): Patent {
  const number = raw.match(/\b(?:EP|CN|US|CH|KR)\s?[\d,./-]+/i)?.[0] ?? null;
  const year = raw.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? null;

  return {
    id: `legacy:patent-${country}-${String(index + 1).padStart(3, "0")}`,
    title: clean(raw.split(":")[0]) || raw,
    inventors: [],
    year: year ? Number(year) : null,
    number,
    country,
    raw,
  };
}

/** Converts every legacy display string without dropping or rewriting its raw source. */
export function createLegacyPublicationsData(): PublicationsData {
  const papers = [
    ...BOOK_CHAPTERS.map((raw, index) => parseLegacyPaper(raw, "book-chapter", index)),
    ...JOURNAL_PAPERS.map((raw, index) => parseLegacyPaper(raw, "journal", index)),
    ...CONFERENCES.map((raw, index) => parseLegacyPaper(raw, "conference", index)),
  ];

  const patents = [
    ...INTERNATIONAL_PATENTS.map((raw, index) =>
      parseLegacyPatent(raw, "international", index),
    ),
    ...DOMESTIC_PATENTS.map((raw, index) =>
      parseLegacyPatent(raw, "domestic", index),
    ),
  ];

  return { updatedAt: LEGACY_UPDATED_AT, papers, patents };
}

export const legacyCounts = {
  bookChapters: BOOK_CHAPTERS.length,
  journalPapers: JOURNAL_PAPERS.length,
  conferences: CONFERENCES.length,
  internationalPatents: INTERNATIONAL_PATENTS.length,
  domesticPatents: DOMESTIC_PATENTS.length,
};
