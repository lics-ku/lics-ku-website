import type { Paper, PaperType } from "../data/publications/schema";

export interface AuthorConfig {
  name: string;
  openAlexAuthorIds: string[];
  secondaryOpenAlexAuthorIds?: string[];
  knownDuplicateOpenAlexWorkIds?: string[];
  orcid?: string;
  institutionId: string;
  institutionName: string;
  affiliationKeywords: string[];
  researchTitleKeywords: string[];
  researchTopicKeywords: string[];
  excludedTopicKeywords: string[];
}

interface OpenAlexTopic {
  display_name?: string | null;
  subfield?: { display_name?: string | null } | null;
  field?: { display_name?: string | null } | null;
  domain?: { display_name?: string | null } | null;
}

export interface OpenAlexWork {
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
    author?: {
      id?: string | null;
      display_name?: string | null;
      orcid?: string | null;
    } | null;
    institutions?: Array<{ id?: string | null; display_name?: string | null }>;
    raw_affiliation_strings?: string[];
  }>;
  primary_topic?: OpenAlexTopic | null;
  topics?: OpenAlexTopic[];
  concepts?: Array<{ display_name?: string | null }>;
}

export interface RelevanceContext {
  trustedCoauthors: Map<string, string>;
  currentMembers: Set<string>;
  trustedVenues: Set<string>;
}

export type RelevanceDecision = "verified" | "pending" | "rejected";
export type AuthorSourceMode = "primary" | "trusted-coauthor-only";

export interface RelevanceResult {
  decision: RelevanceDecision;
  knownCoauthors: string[];
  currentMemberMatches: string[];
  titleMatches: string[];
  topicMatches: string[];
  excludedTopicMatches: string[];
  targetAffiliation: boolean;
  trustedVenue: boolean;
}

export interface DuplicateMatch {
  paper: Paper;
  reason: "id" | "doi" | "title-year-type" | "near-title-version" | "known-metadata";
}

export function normalizeTitle(value: string): string {
  return value
    .replace(/\\n/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function normalizeDoi(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:/, "");
}

function normalizeText(value: string): string {
  return value
    .replace(/\\n/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function keywordMatches(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;
  return ` ${normalizeText(text)} `.includes(` ${normalizedKeyword} `);
}

function matchingKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => keywordMatches(text, keyword));
}

function idMatches(value: string | null | undefined, expected: string): boolean {
  return value === expected || value?.endsWith(`/${expected}`) === true;
}

function isTargetAuthorship(
  authorship: NonNullable<OpenAlexWork["authorships"]>[number],
  author: AuthorConfig,
): boolean {
  return [...author.openAlexAuthorIds, ...(author.secondaryOpenAlexAuthorIds ?? [])]
    .some((id) => idMatches(authorship.author?.id, id));
}

export function hasTargetAffiliation(work: OpenAlexWork, author: AuthorConfig): boolean {
  const authorship = work.authorships?.find((entry) => isTargetAuthorship(entry, author));
  if (!authorship) return false;

  if (authorship.institutions?.some((institution) => idMatches(institution.id, author.institutionId))) {
    return true;
  }

  const affiliation = (authorship.raw_affiliation_strings ?? []).join(" ");
  return author.affiliationKeywords.some((keyword) => keywordMatches(affiliation, keyword));
}

function topicText(work: OpenAlexWork): string {
  const primary = work.primary_topic
    ? [
        work.primary_topic.display_name,
        work.primary_topic.subfield?.display_name,
        work.primary_topic.field?.display_name,
        work.primary_topic.domain?.display_name,
      ]
    : [];
  const topics = (work.topics ?? []).flatMap((topic) => [
    topic.display_name,
    topic.subfield?.display_name,
    topic.field?.display_name,
    topic.domain?.display_name,
  ]);
  const concepts = (work.concepts ?? []).map((concept) => concept.display_name);
  return [...primary, ...topics, ...concepts].filter((value): value is string => Boolean(value)).join(" ");
}

export function buildRelevanceContext(
  verifiedPapers: Paper[],
  currentMemberNames: string[],
  author: AuthorConfig,
): RelevanceContext {
  const targetNames = new Set([normalizeTitle(author.name), normalizeTitle(author.name.replace(/\s+/g, "-"))]);
  const trustedCoauthors = new Map<string, string>();
  const currentMembers = new Set(currentMemberNames.map(normalizeTitle));

  for (const paper of verifiedPapers.filter((entry) => entry.status === "verified")) {
    for (const name of paper.authors) {
      const normalized = normalizeTitle(name);
      if (normalized && !targetNames.has(normalized)) trustedCoauthors.set(normalized, name);
    }
  }
  for (const name of currentMemberNames) {
    const normalized = normalizeTitle(name);
    if (normalized && !targetNames.has(normalized)) trustedCoauthors.set(normalized, name);
  }

  return {
    trustedCoauthors,
    currentMembers,
    trustedVenues: new Set(
      verifiedPapers
        .filter((paper) => paper.status === "verified" && paper.venue)
        .map((paper) => normalizeTitle(paper.venue ?? "")),
    ),
  };
}

export function classifyWork(
  work: OpenAlexWork,
  author: AuthorConfig,
  context: RelevanceContext,
  sourceMode: AuthorSourceMode = "primary",
): RelevanceResult {
  const coauthors = (work.authorships ?? [])
    .filter((authorship) => !isTargetAuthorship(authorship, author))
    .map((authorship) => authorship.author?.display_name?.trim())
    .filter((name): name is string => Boolean(name));
  const knownCoauthors = [...new Map(
    coauthors
      .filter((name) => context.trustedCoauthors.has(normalizeTitle(name)))
      .map((name) => [normalizeTitle(name), name]),
  ).values()];
  const currentMemberMatches = knownCoauthors.filter((name) => context.currentMembers.has(normalizeTitle(name)));
  const titleMatches = matchingKeywords(work.title ?? "", author.researchTitleKeywords);
  const topics = topicText(work);
  const topicMatches = matchingKeywords(topics, author.researchTopicKeywords);
  const excludedTopicMatches = matchingKeywords(`${work.title ?? ""} ${topics}`, author.excludedTopicKeywords);
  const targetAffiliation = hasTargetAffiliation(work, author);
  const venue = normalizeTitle(work.primary_location?.source?.display_name ?? "");
  const trustedVenue = Boolean(venue && context.trustedVenues.has(venue));
  const hasResearchScope = titleMatches.length > 0 || topicMatches.length > 0;

  let decision: RelevanceDecision;
  if (sourceMode === "trusted-coauthor-only") {
    const corroborated = hasResearchScope || targetAffiliation || trustedVenue;
    if (excludedTopicMatches.length > 0) {
      decision = knownCoauthors.length >= 2 && corroborated ? "pending" : "rejected";
    } else if (knownCoauthors.length >= 2 && corroborated) {
      decision = "verified";
    } else if (knownCoauthors.length >= 1 && hasResearchScope) {
      decision = "pending";
    } else {
      decision = "rejected";
    }
  } else {
    if (excludedTopicMatches.length > 0) {
      decision = knownCoauthors.length > 0 ? "pending" : "rejected";
    } else if (
      knownCoauthors.length >= 2 ||
      (knownCoauthors.length >= 1 && hasResearchScope) ||
      (currentMemberMatches.length >= 1 && (targetAffiliation || trustedVenue))
    ) {
      decision = "verified";
    } else if (hasResearchScope || knownCoauthors.length > 0 || targetAffiliation) {
      decision = "pending";
    } else {
      decision = "rejected";
    }
  }
  if (work.type === "preprint" && decision === "verified") decision = "pending";

  return {
    decision,
    knownCoauthors,
    currentMemberMatches,
    titleMatches,
    topicMatches,
    excludedTopicMatches,
    targetAffiliation,
    trustedVenue,
  };
}

export function paperType(work: OpenAlexWork): PaperType {
  if (work.type === "book-chapter") return "book-chapter";
  if (work.type === "conference-paper" || work.primary_location?.source?.type === "conference") return "conference";
  return "journal";
}

export function paperFromWork(work: OpenAlexWork): Paper | null {
  const title = work.title?.trim();
  if (!title) return null;
  const doi = work.doi ? normalizeDoi(work.doi) : null;
  const authorEntries = (work.authorships ?? []).flatMap((authorship) => {
    const name = authorship.author?.display_name?.trim();
    if (!name) return [];
    return [{ name, id: authorship.author?.id?.trim().toLowerCase() || null }];
  });
  const firstIdByName = new Map<string, string>();
  for (const entry of authorEntries) {
    const normalizedName = normalizeTitle(entry.name);
    if (entry.id && !firstIdByName.has(normalizedName)) firstIdByName.set(normalizedName, entry.id);
  }
  const seenAuthorKeys = new Set<string>();
  const authors = authorEntries.flatMap((entry) => {
    const normalizedName = normalizeTitle(entry.name);
    const fallbackId = firstIdByName.get(normalizedName);
    const key = entry.id || fallbackId ? `id:${entry.id ?? fallbackId}` : `name:${normalizedName}`;
    if (seenAuthorKeys.has(key)) return [];
    seenAuthorKeys.add(key);
    return [entry.name];
  });

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

function titleTokens(value: string): Set<string> {
  return new Set(normalizeText(value).split(" ").filter(Boolean));
}

function titleSimilarity(left: string, right: string): number {
  const leftTokens = titleTokens(left);
  const rightTokens = titleTokens(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function authorNameParts(value: string): { surname: string; given: string[] } | null {
  const commaIndex = value.indexOf(",");
  if (commaIndex >= 0) {
    const surname = normalizeText(value.slice(0, commaIndex));
    const given = normalizeText(value.slice(commaIndex + 1)).split(" ").filter(Boolean);
    if (surname && given.length > 0) return { surname, given };
  }
  const tokens = normalizeText(value).split(" ").filter(Boolean);
  if (tokens.length < 2) return null;
  return { surname: tokens.at(-1) ?? "", given: tokens.slice(0, -1) };
}

function authorNamesEquivalent(left: string, right: string): boolean {
  if (normalizeTitle(left) === normalizeTitle(right)) return true;
  const leftParts = authorNameParts(left);
  const rightParts = authorNameParts(right);
  if (!leftParts || !rightParts || leftParts.surname !== rightParts.surname) return false;
  if (leftParts.given.join("") === rightParts.given.join("")) return true;

  const [leftFirst, ...leftTail] = leftParts.given;
  const [rightFirst, ...rightTail] = rightParts.given;
  const tailsAreOnlyInitials = (tokens: string[]) => tokens.every((token) => [...token].length === 1);
  const tokensEquivalent = (leftTokens: string[], rightTokens: string[]) => (
    leftTokens.length === rightTokens.length &&
    leftTokens.every((leftToken, index) => {
      const rightToken = rightTokens[index];
      if (leftToken === rightToken) return true;
      const leftIsInitial = [...leftToken].length === 1;
      const rightIsInitial = [...rightToken].length === 1;
      if (leftIsInitial === rightIsInitial) return false;
      const [initial, full] = leftIsInitial ? [leftToken, rightToken] : [rightToken, leftToken];
      return full.startsWith(initial);
    })
  );

  if (leftFirst === rightFirst) {
    if (tokensEquivalent(leftTail, rightTail)) return true;
    return (
      (leftTail.length === 0 && rightTail.length > 0 && tailsAreOnlyInitials(rightTail)) ||
      (rightTail.length === 0 && leftTail.length > 0 && tailsAreOnlyInitials(leftTail))
    );
  }

  const leftIsInitial = [...leftFirst].length === 1;
  const rightIsInitial = [...rightFirst].length === 1;
  if (leftIsInitial === rightIsInitial) return false;
  const [initial, full] = leftIsInitial ? [leftFirst, rightFirst] : [rightFirst, leftFirst];
  const [initialTail, fullTail] = leftIsInitial ? [leftTail, rightTail] : [rightTail, leftTail];
  return (
    full.startsWith(initial) &&
    (
      tokensEquivalent(initialTail, fullTail) ||
      (initialTail.length === 0 && fullTail.length > 0 && tailsAreOnlyInitials(fullTail))
    )
  );
}

function authorOverlap(left: string[], right: string[]): number {
  const ownerByRightIndex = new Array<number>(right.length).fill(-1);

  function assign(leftIndex: number, visited: Set<number>): boolean {
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (visited.has(rightIndex) || !authorNamesEquivalent(left[leftIndex], right[rightIndex])) continue;
      visited.add(rightIndex);
      if (ownerByRightIndex[rightIndex] === -1 || assign(ownerByRightIndex[rightIndex], visited)) {
        ownerByRightIndex[rightIndex] = leftIndex;
        return true;
      }
    }
    return false;
  }

  return left.reduce(
    (matches, _name, leftIndex) => matches + Number(assign(leftIndex, new Set())),
    0,
  );
}

function authorsEquivalent(left: string[], right: string[]): boolean {
  return left.length > 0 && left.length === right.length && authorOverlap(left, right) === left.length;
}

function authorsAreSubsetCompatible(left: string[], right: string[]): boolean {
  const [smaller, larger] = left.length <= right.length ? [left, right] : [right, left];
  return smaller.length >= 2 && authorOverlap(smaller, larger) === smaller.length;
}

function venuesEquivalent(left: string | null, right: string | null): boolean {
  if (!left || !right) return false;
  const normalizedLeft = normalizeTitle(left);
  const normalizedRight = normalizeTitle(right);
  if (normalizedLeft === normalizedRight) return true;
  const [shorter, longer] = [normalizedLeft, normalizedRight].sort((a, b) => a.length - b.length);
  return shorter.length > 0 && longer.includes(shorter) && shorter.length / longer.length >= 0.75;
}

function isStoredPreprint(paper: Paper): boolean {
  const venue = normalizeText(paper.venue ?? "");
  const repositoryVenues = ["arxiv", "research square", "researchsquare", "biorxiv", "medrxiv"];
  const repositoryDomains = ["arxiv.org", "researchsquare.com", "biorxiv.org", "medrxiv.org"];
  let hostname = "";
  if (paper.url) {
    try {
      hostname = new URL(paper.url).hostname.toLowerCase().replace(/\.$/, "");
    } catch {
      hostname = "";
    }
  }
  return (
    paper.doi?.startsWith("10.48550/arxiv.") === true ||
    repositoryVenues.some((repository) => venue === repository || venue.startsWith(`${repository} `)) ||
    repositoryDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  );
}

export function findKnownDuplicateByMetadata(
  paper: Paper,
  existingPapers: Paper[],
): DuplicateMatch | null {
  const existing = existingPapers.find((candidate) => (
    candidate.year === paper.year &&
    candidate.type === paper.type &&
    authorsEquivalent(candidate.authors, paper.authors) &&
    venuesEquivalent(candidate.venue, paper.venue)
  ));
  return existing ? { paper: existing, reason: "known-metadata" } : null;
}

export function findDuplicate(paper: Paper, work: OpenAlexWork, existingPapers: Paper[]): DuplicateMatch | null {
  for (const existing of existingPapers) {
    const preprintPair = work.type === "preprint" || isStoredPreprint(existing);
    if (paper.doi && existing.doi && normalizeDoi(existing.doi) === paper.doi) {
      return { paper: existing, reason: "doi" };
    }
    if (existing.id === paper.id) return { paper: existing, reason: "id" };
    if (paper.doi && existing.doi && normalizeDoi(existing.doi) !== paper.doi && !preprintPair) continue;

    const sameTitle = normalizeTitle(existing.title) === normalizeTitle(paper.title);
    const sameYear = existing.year === paper.year;
    const sameType = existing.type === paper.type;
    const overlappingAuthors = authorOverlap(existing.authors, paper.authors);
    const yearDistance = existing.year !== null && paper.year !== null
      ? Math.abs(existing.year - paper.year)
      : Number.POSITIVE_INFINITY;
    const compatibleVenue = venuesEquivalent(existing.venue, paper.venue);
    if (sameTitle) {
      const sameAuthors = authorsEquivalent(existing.authors, paper.authors);
      const subsetAuthors = authorsAreSubsetCompatible(existing.authors, paper.authors);
      if (preprintPair && sameAuthors && yearDistance <= 2) {
        return { paper: existing, reason: "near-title-version" };
      }
      if (sameYear && sameType && (sameAuthors || (subsetAuthors && compatibleVenue))) {
        return { paper: existing, reason: "title-year-type" };
      }
      if (
        sameType &&
        yearDistance <= 2 &&
        (
          (sameAuthors && (work.type === "preprint" || compatibleVenue || !existing.venue || !paper.venue)) ||
          (subsetAuthors && compatibleVenue)
        )
      ) {
        return { paper: existing, reason: "near-title-version" };
      }
      continue;
    }

    const similarity = titleSimilarity(existing.title, paper.title);
    if (preprintPair) {
      if (
        yearDistance <= 2 &&
        similarity >= 0.65 &&
        authorsEquivalent(existing.authors, paper.authors)
      ) {
        return { paper: existing, reason: "near-title-version" };
      }
      continue;
    }
    if (yearDistance > 1 || !sameType || overlappingAuthors < 2) continue;
    if (
      similarity >= 0.65 &&
      (compatibleVenue || (similarity >= 0.8 && overlappingAuthors >= 3))
    ) {
      return { paper: existing, reason: "near-title-version" };
    }
  }

  return null;
}
