import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Paper, PaperType, PublicationsData } from "../data/publications/schema";

interface AuthorConfig {
  name: string;
  openAlexAuthorId: string;
  orcid?: string;
  institutionId: string;
  institutionName: string;
  affiliationKeywords: string[];
  researchTitleKeywords: string[];
}

interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  publication_year: number | null;
  type: string;
  primary_location?: {
    landing_page_url?: string | null;
    source?: { display_name?: string | null; type?: string | null } | null;
  } | null;
  authorships?: Array<{
    author?: { id?: string | null } | null;
    institutions?: Array<{ id?: string | null }>;
    raw_affiliation_strings?: string[];
  }>;
}

interface OpenAlexResponse {
  results: OpenAlexWork[];
  meta?: { next_cursor?: string | null };
}

const root = process.cwd();
const publicationsPath = path.join(root, "data", "publications", "publications.json");
const authorsPath = path.join(root, "data", "publications", "authors.json");

function normalizeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeDoi(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:/, "");
}

function isPublicationsData(value: unknown): value is PublicationsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<PublicationsData>;
  return Array.isArray(data.papers) && Array.isArray(data.patents) && typeof data.updatedAt === "string";
}

function isAuthorConfig(value: unknown): value is AuthorConfig {
  if (!value || typeof value !== "object") return false;
  const author = value as Partial<AuthorConfig>;
  return (
    typeof author.name === "string" &&
    /^A\d+$/.test(author.openAlexAuthorId ?? "") &&
    /^I\d+$/.test(author.institutionId ?? "") &&
    typeof author.institutionName === "string" &&
    Array.isArray(author.affiliationKeywords) &&
    author.affiliationKeywords.every((keyword) => typeof keyword === "string") &&
    Array.isArray(author.researchTitleKeywords) &&
    author.researchTitleKeywords.every((keyword) => typeof keyword === "string")
  );
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

async function fetchWorks(author: AuthorConfig): Promise<OpenAlexWork[]> {
  const works: OpenAlexWork[] = [];
  let cursor = "*";

  do {
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("filter", `author.id:${author.openAlexAuthorId}`);
    url.searchParams.set("per-page", "200");
    url.searchParams.set("cursor", cursor);
    url.searchParams.set("sort", "publication_date:desc");
    url.searchParams.set("mailto", "lics@korea.ac.kr");

    const response = await fetch(url, {
      headers: { "User-Agent": "LICS-publications-updater/1.0 (lics@korea.ac.kr)" },
    });
    if (!response.ok) throw new Error(`OpenAlex ${response.status} for ${author.name}`);

    const page = (await response.json()) as OpenAlexResponse;
    if (!Array.isArray(page.results)) throw new Error(`Invalid OpenAlex response for ${author.name}`);
    works.push(...page.results);
    cursor = page.meta?.next_cursor ?? "";
  } while (cursor);

  return works;
}

function hasTargetAffiliation(work: OpenAlexWork, author: AuthorConfig): boolean {
  const authorship = work.authorships?.find(
    (entry) => entry.author?.id?.endsWith(`/${author.openAlexAuthorId}`) || entry.author?.id === author.openAlexAuthorId,
  );
  if (!authorship) return false;

  if (authorship.institutions?.some((institution) => institution.id?.endsWith(`/${author.institutionId}`) || institution.id === author.institutionId)) {
    return true;
  }

  const affiliation = (authorship.raw_affiliation_strings ?? []).join(" ").toLowerCase();
  return author.affiliationKeywords.some((keyword) => affiliation.includes(keyword.toLowerCase()));
}

function paperType(work: OpenAlexWork): PaperType {
  if (work.type === "book-chapter") return "book-chapter";
  if (work.primary_location?.source?.type === "conference") return "conference";
  return "journal";
}

function matchesResearchScope(work: OpenAlexWork, author: AuthorConfig): boolean {
  const title = normalizeTitle(work.title ?? "");
  return author.researchTitleKeywords.some((keyword) => title.includes(normalizeTitle(keyword)));
}

function paperFromWork(work: OpenAlexWork): Paper | null {
  const title = work.title?.trim();
  if (!title) return null;
  const doi = work.doi ? normalizeDoi(work.doi) : null;
  const authors = (work.authorships ?? [])
    .map((authorship) => (authorship as { author?: { display_name?: string | null } }).author?.display_name?.trim())
    .filter((name): name is string => Boolean(name));

  return {
    id: doi ? `doi:${doi}` : `openalex:${work.id.split("/").pop()}`,
    type: paperType(work),
    title,
    authors,
    year: typeof work.publication_year === "number" ? work.publication_year : null,
    venue: work.primary_location?.source?.display_name?.trim() || null,
    doi,
    url: work.primary_location?.landing_page_url ?? (doi ? `https://doi.org/${doi}` : null),
    status: "pending",
    source: "openalex",
  };
}

async function writeAtomically(data: PublicationsData): Promise<void> {
  const temporaryPath = `${publicationsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  try {
    await rename(temporaryPath, publicationsPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function main(): Promise<void> {
  const dataValue = await readJson(publicationsPath);
  const authorValue = await readJson(authorsPath);
  if (!isPublicationsData(dataValue)) throw new Error("publications.json has an invalid top-level shape");
  if (!Array.isArray(authorValue) || !authorValue.every(isAuthorConfig)) {
    throw new Error("authors.json must be an array of valid author settings");
  }

  const data = dataValue;
  const existingDois = new Set(data.papers.flatMap((paper) => (paper.doi ? [normalizeDoi(paper.doi)] : [])));
  const existingTitles = new Set(data.papers.map((paper) => normalizeTitle(paper.title)));
  const legacyTitles = new Set(
    data.papers.filter((paper) => paper.source === "legacy").map((paper) => normalizeTitle(paper.title)),
  );
  const latestVerifiedYear = Math.max(
    ...data.papers
      .filter((paper) => paper.status === "verified" && typeof paper.year === "number")
      .map((paper) => paper.year as number),
  );
  const additions: Paper[] = [];

  for (const author of authorValue) {
    const works = await fetchWorks(author);
    let titleMatches = 0;
    let affiliationMatches = 0;
    let scopedRecentMatches = 0;

    for (const work of works) {
      const normalizedTitle = normalizeTitle(work.title ?? "");
      if (normalizedTitle && legacyTitles.has(normalizedTitle)) titleMatches += 1;
      // Historical gaps are reviewed manually. This prevents an author profile's
      // old or merged records from turning into a large, noisy pending backlog.
      if (typeof work.publication_year !== "number" || work.publication_year <= latestVerifiedYear) continue;
      if (!hasTargetAffiliation(work, author)) continue;
      affiliationMatches += 1;
      if (!matchesResearchScope(work, author)) continue;
      scopedRecentMatches += 1;

      const paper = paperFromWork(work);
      if (!paper) continue;
      const duplicate =
        (paper.doi !== null && existingDois.has(paper.doi)) || existingTitles.has(normalizeTitle(paper.title));
      if (duplicate) continue;

      additions.push(paper);
      existingTitles.add(normalizeTitle(paper.title));
      if (paper.doi) existingDois.add(paper.doi);
    }

    console.log(
      `AUTHOR ${author.name} (${author.openAlexAuthorId}): ${works.length} works, ${titleMatches} legacy/title matches, ${affiliationMatches} recent Korea University-affiliated works, ${scopedRecentMatches} research-scope matches`,
    );
  }

  if (additions.length === 0) {
    console.log("No new pending publications found; publications.json was not changed.");
    return;
  }

  const updated: PublicationsData = {
    ...data,
    updatedAt: new Date().toISOString(),
    papers: [...data.papers, ...additions],
  };
  await writeAtomically(updated);

  console.log(`Added ${additions.length} pending publication(s):`);
  for (const paper of additions) console.log(`- ${paper.title}`);
}

main().catch((error: unknown) => {
  console.error("Publication update failed; publications.json was left unchanged.", error);
  process.exitCode = 1;
});
