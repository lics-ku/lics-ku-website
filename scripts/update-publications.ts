import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  MASTER_STUDENTS,
  PHD_STUDENTS,
  UNDERGRADUATE_STUDENTS,
} from "../data/people/students";
import {
  MS_ALUMNIS,
  PHD_ALUMNIS,
  UNDERGRADUATE_ALUMNIS,
} from "../data/people/alumnis";
import type { Paper, Patent, PublicationsData } from "../data/publications/schema";
import {
  buildRelevanceContext,
  classifyWork,
  findDuplicate,
  findKnownDuplicateByMetadata,
  paperFromWork,
  type AuthorConfig,
  type AuthorSourceMode,
  type OpenAlexWork,
} from "./publication-matching";

interface OpenAlexResponse {
  results: OpenAlexWork[];
  meta?: { next_cursor?: string | null };
}

interface Logger {
  log(message: string): void;
  error(message: string, error?: unknown): void;
}

export interface UpdateSummary {
  fetched: number;
  duplicates: number;
  rejected: number;
  addedVerified: number;
  addedPending: number;
  changed: boolean;
}

export interface UpdateOptions {
  publicationsPath?: string;
  authorsPath?: string;
  currentMemberNames?: string[];
  fetchWorks?: (author: AuthorConfig, authorId: string) => Promise<OpenAlexWork[]>;
  now?: () => Date;
  logger?: Logger;
}

const root = process.cwd();
const defaultPublicationsPath = path.join(root, "data", "publications", "publications.json");
const defaultAuthorsPath = path.join(root, "data", "publications", "authors.json");
const defaultCurrentMemberNames = [
  ...PHD_STUDENTS,
  ...MASTER_STUDENTS,
  ...UNDERGRADUATE_STUDENTS,
  ...PHD_ALUMNIS,
  ...MS_ALUMNIS,
  ...UNDERGRADUATE_ALUMNIS,
].map((person) => person.name);

const paperTypes = new Set(["journal", "conference", "book-chapter"]);
const paperStatuses = new Set(["verified", "pending"]);
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
    Array.isArray(paper.authors) &&
    paper.authors.every((author) => typeof author === "string") &&
    (typeof paper.year === "number" || paper.year === null) &&
    isStringOrNull(paper.venue) &&
    isStringOrNull(paper.doi) &&
    isStringOrNull(paper.url) &&
    paperTypes.has(paper.type as string) &&
    paperStatuses.has(paper.status as string) &&
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
    Array.isArray(patent.inventors) &&
    patent.inventors.every((inventor) => typeof inventor === "string") &&
    (typeof patent.year === "number" || patent.year === null) &&
    isStringOrNull(patent.number) &&
    (patent.country === "domestic" || patent.country === "international") &&
    (patent.raw === undefined || typeof patent.raw === "string")
  );
}

function isPublicationsData(value: unknown): value is PublicationsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.updatedAt === "string" &&
    !Number.isNaN(Date.parse(data.updatedAt)) &&
    Array.isArray(data.papers) &&
    data.papers.every(isPaper) &&
    Array.isArray(data.patents) &&
    data.patents.every(isPatent)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isAuthorIdArray(value: unknown, allowEmpty = false): value is string[] {
  return isStringArray(value) && (allowEmpty || value.length > 0) && value.every((id) => /^A\d+$/.test(id));
}

function isAuthorConfig(value: unknown): value is AuthorConfig {
  if (!value || typeof value !== "object") return false;
  const author = value as Partial<AuthorConfig>;
  return (
    typeof author.name === "string" &&
    isAuthorIdArray(author.openAlexAuthorIds) &&
    (author.secondaryOpenAlexAuthorIds === undefined || isAuthorIdArray(author.secondaryOpenAlexAuthorIds, true)) &&
    (author.knownDuplicateOpenAlexWorkIds === undefined ||
      (isStringArray(author.knownDuplicateOpenAlexWorkIds) &&
        author.knownDuplicateOpenAlexWorkIds.every((id) => /^W\d+$/.test(id)))) &&
    /^I\d+$/.test(author.institutionId ?? "") &&
    typeof author.institutionName === "string" &&
    isStringArray(author.affiliationKeywords) &&
    isStringArray(author.researchTitleKeywords) &&
    isStringArray(author.researchTopicKeywords) &&
    isStringArray(author.excludedTopicKeywords)
  );
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function fetchWorksFromOpenAlex(author: AuthorConfig, authorId: string): Promise<OpenAlexWork[]> {
  const works: OpenAlexWork[] = [];
  let cursor = "*";

  do {
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("filter", `author.id:${authorId}`);
    url.searchParams.set("per-page", "200");
    url.searchParams.set("cursor", cursor);
    url.searchParams.set("sort", "publication_date:desc");
    url.searchParams.set("mailto", "lics@korea.ac.kr");

    const response = await fetch(url, {
      headers: { "User-Agent": "LICS-publications-updater/2.0 (lics@korea.ac.kr)" },
    });
    if (!response.ok) throw new Error(`OpenAlex ${response.status} for ${author.name} (${authorId})`);

    const page = (await response.json()) as OpenAlexResponse;
    if (!Array.isArray(page.results)) {
      throw new Error(`Invalid OpenAlex response for ${author.name} (${authorId})`);
    }
    works.push(...page.results);
    cursor = page.meta?.next_cursor ?? "";
  } while (cursor);

  return works;
}

export async function writePublicationsAtomically(
  publicationsPath: string,
  data: PublicationsData,
): Promise<void> {
  const temporaryPath = `${publicationsPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(temporaryPath, publicationsPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

function authorSources(author: AuthorConfig): Array<{ id: string; mode: AuthorSourceMode }> {
  return [
    ...author.openAlexAuthorIds.map((id) => ({ id, mode: "primary" as const })),
    ...(author.secondaryOpenAlexAuthorIds ?? []).map((id) => ({
      id,
      mode: "trusted-coauthor-only" as const,
    })),
  ];
}

export async function runPublicationUpdate(options: UpdateOptions = {}): Promise<UpdateSummary> {
  const publicationsPath = options.publicationsPath ?? defaultPublicationsPath;
  const authorsPath = options.authorsPath ?? defaultAuthorsPath;
  const currentMemberNames = options.currentMemberNames ?? defaultCurrentMemberNames;
  const fetchWorks = options.fetchWorks ?? fetchWorksFromOpenAlex;
  const now = options.now ?? (() => new Date());
  const logger = options.logger ?? console;

  const dataValue = await readJson(publicationsPath);
  const authorValue = await readJson(authorsPath);
  if (!isPublicationsData(dataValue)) throw new Error("publications.json has an invalid top-level shape");
  if (!Array.isArray(authorValue) || !authorValue.every(isAuthorConfig)) {
    throw new Error("authors.json must be an array of valid author settings");
  }

  const data = dataValue;
  const existingPapers: Paper[] = [...data.papers];
  const additions: Paper[] = [];
  const summary: UpdateSummary = {
    fetched: 0,
    duplicates: 0,
    rejected: 0,
    addedVerified: 0,
    addedPending: 0,
    changed: false,
  };

  for (const author of authorValue) {
    const context = buildRelevanceContext(data.papers, currentMemberNames, author);
    for (const source of authorSources(author)) {
      const works = await fetchWorks(author, source.id);
      summary.fetched += works.length;
      logger.log(`AUTHOR ${author.name} (${source.id}, ${source.mode}): ${works.length} works fetched`);

      for (const work of works) {
        const workId = work.id.split("/").pop() ?? "";
        const paper = paperFromWork(work);
        if (!paper) {
          summary.rejected += 1;
          continue;
        }

        if (author.knownDuplicateOpenAlexWorkIds?.includes(workId)) {
          const knownDuplicate = findKnownDuplicateByMetadata(paper, existingPapers);
          if (knownDuplicate) {
            summary.duplicates += 1;
            continue;
          }
          logger.error(
            `Configured duplicate ${workId} no longer matches an existing paper; evaluating it normally.`,
          );
        }

        const duplicate = findDuplicate(paper, work, existingPapers);
        if (duplicate) {
          summary.duplicates += 1;
          continue;
        }

        const relevance = classifyWork(work, author, context, source.mode);
        if (relevance.decision === "rejected") {
          summary.rejected += 1;
          continue;
        }

        paper.status = relevance.decision;
        additions.push(paper);
        existingPapers.push(paper);
        if (paper.status === "verified") summary.addedVerified += 1;
        else summary.addedPending += 1;
      }
    }
  }

  if (additions.length === 0) {
    logger.log(
      `No new publications found; ${summary.duplicates} duplicate(s) and ${summary.rejected} unrelated work(s) skipped. publications.json was not changed.`,
    );
    return summary;
  }

  const updated: PublicationsData = {
    ...data,
    updatedAt: now().toISOString(),
    papers: [...data.papers, ...additions],
  };
  await writePublicationsAtomically(publicationsPath, updated);
  summary.changed = true;

  logger.log(
    `Added ${additions.length} publication(s): ${summary.addedVerified} verified, ${summary.addedPending} pending; ${summary.duplicates} duplicate(s) and ${summary.rejected} unrelated work(s) skipped.`,
  );
  for (const paper of additions) logger.log(`- [${paper.status}] ${paper.title}`);
  return summary;
}

async function main(): Promise<void> {
  await runPublicationUpdate();
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entryPoint) {
  main().catch((error: unknown) => {
    console.error("Publication update failed; publications.json was left unchanged.", error);
    process.exitCode = 1;
  });
}
