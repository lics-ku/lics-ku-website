import assert from "node:assert/strict";
import test from "node:test";
import type { Paper } from "../data/publications/schema";
import {
  buildRelevanceContext,
  classifyWork,
  findDuplicate,
  normalizeTitle,
  paperFromWork,
  type AuthorConfig,
  type OpenAlexWork,
} from "./publication-matching";

const author: AuthorConfig = {
  name: "Sang Hyun Lee",
  openAlexAuthorIds: ["A5100460354"],
  orcid: "0000-0001-5385-2061",
  institutionId: "I197347611",
  institutionName: "Korea University",
  affiliationKeywords: ["Korea University", "korea.ac.kr"],
  researchTitleKeywords: [
    "wireless",
    "network optimization",
    "localization",
    "link adaptation",
    "zebrafish",
    "electrical conductivity",
  ],
  researchTopicKeywords: [
    "wireless",
    "network coding",
    "localization",
    "mimo",
    "zebrafish",
  ],
  excludedTopicKeywords: ["astronomy", "astrophysics", "dark energy", "epilepsy"],
};

function work({
  id = "W1",
  title,
  year,
  type = "article",
  doi = null,
  venue = "Example Venue",
  targetInstitution = "Korea University",
  coauthors = [],
  topic = "",
  field = "Engineering",
}: {
  id?: string;
  title: string;
  year: number;
  type?: string;
  doi?: string | null;
  venue?: string | null;
  targetInstitution?: string | null;
  coauthors?: string[];
  topic?: string;
  field?: string;
}): OpenAlexWork {
  return {
    id: `https://openalex.org/${id}`,
    doi,
    title,
    publication_year: year,
    type,
    primary_location: {
      landing_page_url: doi,
      source: venue ? { display_name: venue, type: type === "conference-paper" ? "conference" : "journal" } : null,
    },
    authorships: [
      ...coauthors.map((displayName, index) => ({
        author: { id: `https://openalex.org/A${index + 1}`, display_name: displayName, orcid: null },
        institutions: [],
        raw_affiliation_strings: [],
      })),
      {
        author: {
          id: "https://openalex.org/A5100460354",
          display_name: "Sang Hyun Lee",
          orcid: "https://orcid.org/0000-0001-5385-2061",
        },
        institutions: targetInstitution
          ? [{
              id: targetInstitution === "Korea University"
                ? "https://openalex.org/I197347611"
                : "https://openalex.org/I999",
              display_name: targetInstitution,
            }]
          : [],
        raw_affiliation_strings: targetInstitution ? [targetInstitution] : [],
      },
    ],
    primary_topic: topic
      ? {
          display_name: topic,
          subfield: { display_name: topic },
          field: { display_name: field },
          domain: { display_name: field === "Engineering" ? "Physical Sciences" : "Other" },
        }
      : null,
    topics: [],
    concepts: [],
  };
}

function verifiedPaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "legacy:journal-001",
    type: "journal",
    title: "An existing wireless paper",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2026,
    venue: "IEEE Communications Magazine",
    doi: null,
    url: null,
    status: "verified",
    source: "legacy",
    ...overrides,
  };
}

test("classifies an older work with a trusted coauthor and research topic as verified", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const candidate = work({
    title: "Constraint-Compliant Network Optimization through Large Language Models",
    year: 2025,
    targetInstitution: null,
    coauthors: ["Wookjin Lee", "Hong Ki Kim"],
    topic: "Software-Defined Networks and 5G",
  });

  const result = classifyWork(candidate, author, context);

  assert.equal(result.decision, "verified");
  assert.deepEqual(result.knownCoauthors.sort(), ["Hong Ki Kim", "Wookjin Lee"]);
});

test("keeps a preprint pending even when its relevance evidence is strong", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const preprint = work({
    title: "Constraint-Compliant Network Optimization through Large Language Models",
    year: 2025,
    type: "preprint",
    targetInstitution: null,
    coauthors: ["Wookjin Lee", "Hong Ki Kim"],
    topic: "Software-Defined Networks and 5G",
  });

  assert.equal(classifyWork(preprint, author, context).decision, "pending");
});

test("keeps a research-scope-only work as pending instead of dropping it", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const candidate = work({
    title: "Probabilistic Representation for Robust Link Adaptation in Deep Reinforcement Learning-based 5G Systems",
    year: 2025,
    targetInstitution: "Samsung Electronics",
    coauthors: ["Juhwan Song", "Yujin Nam"],
    topic: "Advanced MIMO Systems Optimization",
  });

  assert.equal(classifyWork(candidate, author, context).decision, "pending");
});

test("rejects obvious homonym pollution despite the merged profile ORCID", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const candidate = work({
    title: "Interacting dark energy constraints from BOSS DR12",
    year: 2025,
    targetInstitution: "Jet Propulsion Laboratory",
    topic: "Astronomy and Astrophysical Research",
    field: "Physics and Astronomy",
  });

  const result = classifyWork(candidate, author, context);

  assert.equal(result.decision, "rejected");
  assert.ok(result.excludedTopicMatches.length > 0);
});

test("demotes an excluded-topic work with trusted coauthors instead of auto-publishing it", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const conflicted = work({
    title: "Wireless monitoring for pediatric epilepsy",
    year: 2025,
    coauthors: ["Hong Ki Kim", "Wookjin Lee"],
    topic: "Epilepsy research and treatment",
    field: "Medicine",
  });

  assert.equal(classifyWork(conflicted, author, context).decision, "pending");
});

test("applies excluded-topic keywords found only in the title", () => {
  const context = buildRelevanceContext([verifiedPaper()], [], author);
  const titleOnlyConflict = work({
    title: "Wireless monitoring for pediatric epilepsy",
    year: 2025,
    coauthors: ["Hong Ki Kim"],
    topic: "Advanced Wireless Communication",
  });

  const result = classifyWork(titleOnlyConflict, author, context);

  assert.equal(result.decision, "pending");
  assert.deepEqual(result.excludedTopicMatches, ["epilepsy"]);
});

test("keeps a target-affiliated new research area pending when no other signal is known", () => {
  const context = buildRelevanceContext([verifiedPaper()], [], author);
  const newArea = work({
    title: "An unfamiliar interdisciplinary study",
    year: 2025,
    venue: "New Interdisciplinary Journal",
    topic: "Emerging Interdisciplinary Methods",
  });

  const result = classifyWork(newArea, author, context);

  assert.equal(result.targetAffiliation, true);
  assert.equal(result.decision, "pending");
});

test("requires corroborating coauthors for a strict secondary author profile", () => {
  const context = buildRelevanceContext([verifiedPaper()], ["Wookjin Lee"], author);
  const scopeOnly = work({
    title: "Wireless optimization by an unrelated namesake",
    year: 2025,
    targetInstitution: "University of Michigan",
    topic: "Advanced Wireless Communication",
  });
  const labWork = work({
    title: "Q-xApp: A Collaborative Framework for Wireless Networks",
    year: 2025,
    coauthors: ["Hong Ki Kim", "Wookjin Lee"],
    topic: "Wireless Network Optimization",
  });

  assert.equal(classifyWork(scopeOnly, author, context, "trusted-coauthor-only").decision, "rejected");
  assert.equal(classifyWork(labWork, author, context, "trusted-coauthor-only").decision, "verified");
});

test("does not use the latest verified year as an eligibility gate", () => {
  const context = buildRelevanceContext([verifiedPaper({ year: 2026 })], [], author);
  const older = work({
    title: "Wireless localization from the archive",
    year: 2022,
    coauthors: ["Hong Ki Kim"],
    topic: "Indoor and Outdoor Localization Technologies",
  });

  assert.equal(classifyWork(older, author, context).decision, "verified");
});

test("deduplicates by DOI but preserves same-title works with a different year or type", () => {
  const existing = verifiedPaper({
    id: "doi:10.1000/shared",
    title: "Shared Publication Title",
    year: 2024,
    type: "journal",
    doi: "10.1000/shared",
  });

  assert.equal(
    findDuplicate(paperFromWork(work({
      id: "W-doi",
      title: "A renamed record",
      year: 2024,
      doi: "https://doi.org/10.1000/shared",
    }))!, work({ title: "A renamed record", year: 2024, doi: "https://doi.org/10.1000/shared" }), [existing])?.reason,
    "doi",
  );
  assert.equal(
    findDuplicate(paperFromWork(work({ title: "Shared Publication Title", year: 2025 }))!, work({ title: "Shared Publication Title", year: 2025 }), [existing]),
    null,
  );
  assert.equal(
    findDuplicate(
      paperFromWork(work({ title: "Shared Publication Title", year: 2024, type: "conference-paper" }))!,
      work({ title: "Shared Publication Title", year: 2024, type: "conference-paper" }),
      [existing],
    ),
    null,
  );
  assert.equal(
    findDuplicate(
      paperFromWork(work({ title: "Shared Publication Title", year: 2024, doi: "10.1000/other" }))!,
      work({ title: "Shared Publication Title", year: 2024, doi: "10.1000/other" }),
      [existing],
    ),
    null,
  );
});

test("matches an online-first year shift only with corroborating authors and venue", () => {
  const existing = verifiedPaper({
    title: "Distributed Hybrid NOMA/OMA User Allocation for Wireless IoT Networks",
    authors: ["Wookjin Lee", "Sung Il Choi", "Yong Hun Jang", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Internet of Things Journal",
  });
  const onlineFirst = work({
    title: "Distributed Hybrid NOMA/OMA User Allocation for Wireless IoT Networks",
    year: 2023,
    venue: "IEEE Internet of Things Journal",
    coauthors: ["Wookjin Lee", "Sung Il Choi", "Yong Hun Jang"],
  });

  assert.equal(findDuplicate(paperFromWork(onlineFirst)!, onlineFirst, [existing])?.reason, "near-title-version");
});

test("normalizes a literal escaped newline before title duplicate comparison", () => {
  const existing = verifiedPaper({
    title: "Deep Learning for Distributed Optimization: Applications to Wireless Resource Management",
    year: 2019,
  });
  const escaped = work({
    title: "Deep Learning for Distributed Optimization: Applications to Wireless\\n Resource Management",
    year: 2019,
    venue: "IEEE Communications Magazine",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(findDuplicate(paperFromWork(escaped)!, escaped, [existing])?.reason, "title-year-type");
});

test("keeps distinct non-Latin titles non-empty and distinct", () => {
  assert.notEqual(normalizeTitle("무선 통신 시스템"), "");
  assert.notEqual(normalizeTitle("무선 통신 시스템"), normalizeTitle("無線通信システム"));
});

test("allows incomplete author metadata but rejects crossed author sets for an exact title", () => {
  const existing = verifiedPaper({
    title: "Shared Publication Title",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Communications Magazine",
  });
  const unsupported = work({
    title: "Shared Publication Title",
    year: 2024,
    venue: "Different Journal",
  });
  const partialAuthors = work({
    title: "Shared Publication Title",
    year: 2024,
    venue: "IEEE Communications Magazine",
    coauthors: ["Hong Ki Kim"],
  });
  const crossedAuthors = work({
    title: "Shared Publication Title",
    year: 2024,
    venue: "IEEE Communications Magazine",
    coauthors: ["Hong Ki Kim", "Wookjin Lee"],
  });
  const fullAuthors = work({
    title: "Shared Publication Title",
    year: 2024,
    venue: "IEEE Communications Magazine",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(findDuplicate(paperFromWork(unsupported)!, unsupported, [existing]), null);
  assert.equal(findDuplicate(paperFromWork(partialAuthors)!, partialAuthors, [existing])?.reason, "title-year-type");
  assert.equal(findDuplicate(paperFromWork(crossedAuthors)!, crossedAuthors, [existing]), null);
  assert.equal(findDuplicate(paperFromWork(fullAuthors)!, fullAuthors, [existing])?.reason, "title-year-type");
});

test("matches an exact title with the full author set when venue names are translated", () => {
  const existing = verifiedPaper({
    title: "Spectral analysis of flickering effects in binary dimmable visible light communication",
    authors: ["Sang Hyun Lee", "Jae Kyun Kwon"],
    year: 2015,
    venue: "Journal of Korean Institute of Communications and Information Sciences",
  });
  const translatedVenue = work({
    title: "Spectral Analysis of Flickering Effects in Binary Dimmable Visible Light Communication",
    year: 2015,
    venue: "한국통신학회논문지",
    coauthors: ["Jae Kyun Kwon"],
  });

  assert.equal(
    findDuplicate(paperFromWork(translatedVenue)!, translatedVenue, [existing])?.reason,
    "title-year-type",
  );
});

test("deduplicates repeated authorships in the stored paper", () => {
  const repeated = work({
    title: "Zebrafish behavior analysis",
    year: 2023,
    coauthors: ["Yun Jae Choi", "Yun Jae Choi", "Saemi Park"],
    topic: "Zebrafish Biomedical Research",
  });
  repeated.authorships![1].author!.id = repeated.authorships![0].author!.id;

  assert.deepEqual(paperFromWork(repeated)?.authors, ["Yun Jae Choi", "Saemi Park", "Sang Hyun Lee"]);
});

test("preserves same-name authors when their OpenAlex author IDs differ", () => {
  const homonymousCoauthors = work({
    title: "Wireless collaboration across institutions",
    year: 2024,
    coauthors: ["Wei Wang", "Wei Wang"],
    topic: "Advanced Wireless Communication",
  });

  assert.deepEqual(paperFromWork(homonymousCoauthors)?.authors, ["Wei Wang", "Wei Wang", "Sang Hyun Lee"]);
});

test("deduplicates an ID-less authorship when the same named author has an ID", () => {
  const repeated = work({
    title: "Zebrafish behavior analysis",
    year: 2023,
    coauthors: ["Yun Jae Choi", "Saemi Park"],
    topic: "Zebrafish Biomedical Research",
  });
  repeated.authorships!.splice(1, 0, {
    author: { id: null, display_name: "Yun Jae Choi", orcid: null },
    institutions: [],
    raw_affiliation_strings: [],
  });

  assert.deepEqual(paperFromWork(repeated)?.authors, ["Yun Jae Choi", "Saemi Park", "Sang Hyun Lee"]);
});

test("preserves first-appearance author order when an ID-less duplicate comes first", () => {
  const repeated = work({
    title: "Zebrafish behavior analysis",
    year: 2023,
    coauthors: ["Yun Jae Choi", "Saemi Park"],
    topic: "Zebrafish Biomedical Research",
  });
  const [yunWithId, saemi, target] = repeated.authorships!;
  repeated.authorships = [
    {
      author: { id: null, display_name: "Yun Jae Choi", orcid: null },
      institutions: [],
      raw_affiliation_strings: [],
    },
    saemi,
    yunWithId,
    target,
  ];

  assert.deepEqual(paperFromWork(repeated)?.authors, ["Yun Jae Choi", "Saemi Park", "Sang Hyun Lee"]);
});

test("does not treat distinct full given names as initial aliases", () => {
  const existing = verifiedPaper({
    title: "Shared Wireless Study",
    authors: ["Hong Ki Kim", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Communications Magazine",
  });
  const differentAuthors = work({
    title: existing.title,
    year: existing.year!,
    venue: existing.venue,
    coauthors: ["Hoon Kim"],
  });

  assert.equal(findDuplicate(paperFromWork(differentAuthors)!, differentAuthors, [existing]), null);
});

test("does not collapse distinct full middle names to the same initial", () => {
  const existing = verifiedPaper({
    title: "Shared Cooperative Study",
    authors: ["Hong Ki Kim", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Communications Magazine",
  });
  const differentAuthors = work({
    title: existing.title,
    year: existing.year!,
    venue: existing.venue,
    coauthors: ["Hong Kyu Kim"],
  });

  assert.equal(findDuplicate(paperFromWork(differentAuthors)!, differentAuthors, [existing]), null);
});

test("recognizes a near-title preprint as the existing journal work using year and coauthors", () => {
  const existing = verifiedPaper({
    title: "Wireless Interconnection Network-Enhanced (WINE) for Post-Exascale High Performance Computing",
    authors: ["Hong Ki Kim", "Yong Hun Jang", "Heesoo Kim", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Wireless Communications Magazine",
  });
  const preprint = work({
    title: "Wireless Interconnection Network (WINE) for Post-Exascale High-Performance Computing",
    year: 2024,
    type: "preprint",
    venue: "arXiv (Cornell University)",
    coauthors: ["Hong Ki Kim", "Yong Hun Jang", "Hee Soo Kim"],
    topic: "Interconnection Networks and Systems",
  });

  assert.equal(findDuplicate(paperFromWork(preprint)!, preprint, [existing])?.reason, "near-title-version");
});

test("recognizes a near-title journal version despite a minor venue-name suffix", () => {
  const existing = verifiedPaper({
    title: "Wireless Interconnection Network-Enhanced (WINE) for Post-Exascale High Performance Computing",
    authors: ["Hong Ki Kim", "Yong Hun Jang", "Heesoo Kim", "Won Young Kang", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Wireless Communications Magazine",
  });
  const indexedVersion = work({
    title: "Wireless Interconnection Network for Post-Exascale High-Performance Computing",
    year: 2024,
    venue: "IEEE Wireless Communications",
    coauthors: ["Hong Ki Kim", "Yong Hun Jang", "Hee Soo Kim", "Won Young Kang"],
    topic: "Interconnection Networks and Systems",
  });

  assert.equal(findDuplicate(paperFromWork(indexedVersion)!, indexedVersion, [existing])?.reason, "near-title-version");
});

test("matches abbreviated author names in otherwise corroborated metadata", () => {
  const existing = verifiedPaper({
    title: "Message-Passing-Based Joint User Association and Time Allocation",
    authors: ["Hongju Lee", "Jihwan Moon", "Changick Song", "Sang Hyun Lee", "I. Lee"],
    year: 2022,
    venue: "IEEE Transactions on Wireless Communications",
  });
  const indexed = work({
    title: existing.title,
    year: 2021,
    venue: existing.venue,
    coauthors: ["Hongju Lee", "Jihwan Moon", "Changick Song", "Inkyu Lee"],
  });

  assert.equal(findDuplicate(paperFromWork(indexed)!, indexed, [existing])?.reason, "near-title-version");
});

test("matches comma-reversed and initial-only author metadata", () => {
  const existing = verifiedPaper({
    title: "Constraint-Compliant Wireless Optimization",
    authors: ["Young-Jin Song", "Tony Q. S. Quek", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Communications Magazine",
  });
  const indexed = work({
    title: existing.title,
    year: existing.year!,
    venue: existing.venue,
    coauthors: ["Song, Youngjin", "T. Quek"],
  });

  assert.equal(findDuplicate(paperFromWork(indexed)!, indexed, [existing])?.reason, "title-year-type");
});

test("accepts an incomplete author subset only with matching version metadata", () => {
  const existing = verifiedPaper({
    title: "Distributed scheduling using belief propagation for internet-of-things (IoT) networks",
    authors: ["Illsoo Sohn", "Sang Hyun Lee"],
    year: 2018,
    venue: "Peer-to-Peer Networking and Applications",
  });
  const indexed = work({
    title: existing.title,
    year: 2016,
    venue: existing.venue,
    coauthors: ["Illsoo Sohn", "Sang Won Yoon"],
  });

  assert.equal(findDuplicate(paperFromWork(indexed)!, indexed, [existing])?.reason, "near-title-version");
});

test("matches an exact-title preprint despite its repository venue", () => {
  const existing = verifiedPaper({
    title: "A Deep Learning Approach to Universal Binary Visible Light Communication Transceiver",
    authors: ["Hoon Lee", "Tony Q. S. Quek", "Sang Hyun Lee"],
    year: 2020,
    venue: "IEEE Transactions on Wireless Communications",
  });
  const preprint = work({
    title: existing.title,
    year: 2019,
    type: "preprint",
    venue: "arXiv (Cornell University)",
    coauthors: ["Hoon Lee", "Tony Q. S. Quek"],
  });

  assert.equal(findDuplicate(paperFromWork(preprint)!, preprint, [existing])?.reason, "near-title-version");
});

test("matches a conference preprint with a different arXiv DOI", () => {
  const existing = verifiedPaper({
    id: "doi:10.1109/example.2024.1",
    type: "conference",
    title: "Distributed Wireless Conference Optimization",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE GLOBECOM",
    doi: "10.1109/example.2024.1",
  });
  const preprint = work({
    title: existing.title,
    year: 2023,
    type: "preprint",
    doi: "https://doi.org/10.48550/arxiv.2301.00001",
    venue: "arXiv (Cornell University)",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(findDuplicate(paperFromWork(preprint)!, preprint, [existing])?.reason, "near-title-version");
});

test("matches a published conference against an already staged preprint", () => {
  const stagedPreprint = verifiedPaper({
    id: "doi:10.48550/arxiv.2301.00001",
    type: "journal",
    title: "Distributed Wireless Conference Optimization",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2023,
    venue: "arXiv (Cornell University)",
    doi: "10.48550/arxiv.2301.00001",
    status: "pending",
    source: "openalex",
  });
  const published = work({
    title: stagedPreprint.title,
    year: 2024,
    type: "conference-paper",
    doi: "https://doi.org/10.1109/example.2024.1",
    venue: "IEEE GLOBECOM",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(
    findDuplicate(paperFromWork(published)!, published, [stagedPreprint])?.reason,
    "near-title-version",
  );
});

test("recognizes a stored preprint from its URL when DOI and venue are absent", () => {
  const stagedPreprint = verifiedPaper({
    id: "openalex:W-preprint",
    type: "journal",
    title: "Distributed Wireless Conference Optimization",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2023,
    venue: null,
    doi: null,
    url: "https://arxiv.org/abs/2301.00001",
    status: "pending",
    source: "openalex",
  });
  const published = work({
    title: stagedPreprint.title,
    year: 2024,
    type: "conference-paper",
    doi: "https://doi.org/10.1109/example.2024.1",
    venue: "IEEE GLOBECOM",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(
    findDuplicate(paperFromWork(published)!, published, [stagedPreprint])?.reason,
    "near-title-version",
  );
});

test("recognizes a Research Square repository hostname", () => {
  const stagedPreprint = verifiedPaper({
    id: "openalex:W-preprint",
    type: "journal",
    title: "Distributed Wireless Conference Optimization",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2023,
    venue: null,
    doi: null,
    url: "https://www.researchsquare.com/article/rs-123/v1",
    status: "pending",
    source: "openalex",
  });
  const published = work({
    title: stagedPreprint.title,
    year: 2024,
    type: "conference-paper",
    venue: "IEEE GLOBECOM",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(
    findDuplicate(paperFromWork(published)!, published, [stagedPreprint])?.reason,
    "near-title-version",
  );
});

test("does not infer a preprint from an unrelated URL path or query", () => {
  const publishedJournal = verifiedPaper({
    title: "Shared Cross-Type Publication",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2024,
    venue: null,
    doi: null,
    url: "https://publisher.example/articles/arxiv-comparison?source=arxiv",
  });
  const conference = work({
    title: publishedJournal.title,
    year: 2024,
    type: "conference-paper",
    venue: "IEEE GLOBECOM",
    coauthors: ["Hong Ki Kim", "Saemi Park"],
  });

  assert.equal(findDuplicate(paperFromWork(conference)!, conference, [publishedJournal]), null);
});

test("does not merge a fuzzy-title preprint with a crossed author set", () => {
  const existing = verifiedPaper({
    title: "Wireless Interconnection Network-Enhanced for Post-Exascale Computing",
    authors: ["Hong Ki Kim", "Saemi Park", "Sang Hyun Lee"],
    year: 2024,
    venue: "IEEE Wireless Communications Magazine",
  });
  const crossed = work({
    title: "Wireless Interconnection Network for Post Exascale Computing",
    year: 2024,
    type: "preprint",
    venue: "arXiv (Cornell University)",
    coauthors: ["Hong Ki Kim", "Wookjin Lee"],
  });

  assert.equal(findDuplicate(paperFromWork(crossed)!, crossed, [existing]), null);
});
