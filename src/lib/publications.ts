/**
 * Temporary publications adapter.
 *
 * Converts the hand-maintained legacy arrays (publicationContent / conferences /
 * patents) into the shared {@link PublicationsData} contract from
 * `data/publications/schema.ts`. Everything is marked `source: "legacy"` and
 * `status: "verified"`.
 *
 * When the W2 collection pipeline lands its validated loader, the dispatcher can
 * swap the single import below for `loadPublications()` — the exported
 * `getPublicationsData(): Promise<PublicationsData>` signature is the seam.
 */
import type {
  Paper,
  PaperType,
  Patent,
  PublicationsData,
} from "@data/publications/schema";
import { CONFERENCES } from "@data/publications/conferences";
import {
  DOMESTIC_PATENTS,
  INTERNATIONAL_PATENTS,
} from "@data/publications/patents";
import {
  BOOK_CHAPTERS,
  JOURNAL_PAPERS,
} from "@data/publications/publicationContent";

const normalizeQuotes = (s: string) =>
  s.replace(/[“”″]/g, '"').replace(/[‘’]/g, "'");

const lastYear = (s: string): number | null => {
  const matches = s.match(/\b(19|20)\d{2}\b/g);
  if (!matches || matches.length === 0) return null;
  return Number(matches[matches.length - 1]);
};

const parseAuthors = (segment: string): string[] =>
  segment
    .replace(/[,\s]+$/, "")
    .split(",")
    .map((a) => a.replace(/^\s*and\s+/i, "").trim())
    .filter(Boolean);

const parsePaper = (raw: string, type: PaperType, index: number): Paper => {
  const normalized = normalizeQuotes(raw);
  const match = normalized.match(/"([^"]+)"/);

  let title = normalized;
  let authors: string[] = [];
  let venue: string | null = null;

  if (match && match.index !== undefined) {
    title = match[1].replace(/[,;.\s]+$/, "").trim();
    authors = parseAuthors(normalized.slice(0, match.index));
    venue =
      normalized
        .slice(match.index + match[0].length)
        .replace(/^[,\s]+/, "")
        .replace(/\s+/g, " ")
        .trim() || null;
  }

  return {
    id: `legacy:${type}-${index + 1}`,
    type,
    title,
    authors,
    year: venue ? lastYear(venue) : lastYear(normalized),
    venue,
    doi: null,
    url: null,
    status: "verified",
    source: "legacy",
    raw,
  };
};

const parsePatent = (
  raw: string,
  country: Patent["country"],
  index: number
): Patent => {
  const splitAt = raw.indexOf(": ");
  const title = splitAt >= 0 ? raw.slice(0, splitAt).trim() : raw.trim();
  const number = splitAt >= 0 ? raw.slice(splitAt + 2).trim() : null;
  return {
    id: `legacy:patent-${country === "domestic" ? "dom" : "intl"}-${index + 1}`,
    title,
    inventors: [],
    year: lastYear(raw),
    number,
    country,
    raw,
  };
};

export async function getPublicationsData(): Promise<PublicationsData> {
  const papers: Paper[] = [
    ...JOURNAL_PAPERS.map((raw, i) => parsePaper(raw, "journal", i)),
    ...CONFERENCES.map((raw, i) => parsePaper(raw, "conference", i)),
    ...BOOK_CHAPTERS.map((raw, i) => parsePaper(raw, "book-chapter", i)),
  ];

  const patents: Patent[] = [
    ...INTERNATIONAL_PATENTS.map((raw, i) =>
      parsePatent(raw, "international", i)
    ),
    ...DOMESTIC_PATENTS.map((raw, i) => parsePatent(raw, "domestic", i)),
  ];

  return {
    updatedAt: new Date().toISOString(),
    papers,
    patents,
  };
}
