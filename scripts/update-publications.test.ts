import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { Paper, PublicationsData } from "../data/publications/schema";
import type { AuthorConfig, OpenAlexWork } from "./publication-matching";
import { runPublicationUpdate, writePublicationsAtomically } from "./update-publications";

const silentLogger = { log: () => undefined, error: () => undefined };

const existingPaper: Paper = {
  id: "legacy:journal-001",
  type: "journal",
  title: "Existing 2026 wireless publication",
  authors: ["Hong Ki Kim", "Sang Hyun Lee"],
  year: 2026,
  venue: "IEEE Communications Magazine",
  doi: null,
  url: null,
  status: "verified",
  source: "legacy",
  raw: "original legacy value",
};

const author: AuthorConfig = {
  name: "Sang Hyun Lee",
  openAlexAuthorIds: ["A5100460354"],
  orcid: "0000-0001-5385-2061",
  institutionId: "I197347611",
  institutionName: "Korea University",
  affiliationKeywords: ["Korea University", "korea.ac.kr"],
  researchTitleKeywords: ["wireless", "network optimization", "link adaptation"],
  researchTopicKeywords: ["wireless", "mimo"],
  excludedTopicKeywords: ["astronomy", "dark energy"],
};

function candidate({
  id,
  title,
  targetId = "A5100460354",
  coauthors = [],
  topic,
  institution = "Korea University",
  year = 2022,
  venue = "Example Journal",
}: {
  id: string;
  title: string;
  targetId?: string;
  coauthors?: string[];
  topic: string;
  institution?: string;
  year?: number;
  venue?: string;
}): OpenAlexWork {
  return {
    id: `https://openalex.org/${id}`,
    doi: null,
    title,
    publication_year: year,
    type: "article",
    primary_location: {
      landing_page_url: `https://openalex.org/${id}`,
      source: { display_name: venue, type: "journal" },
    },
    authorships: [
      ...coauthors.map((name, index) => ({
        author: { id: `https://openalex.org/C${index}`, display_name: name, orcid: null },
        institutions: [],
        raw_affiliation_strings: [],
      })),
      {
        author: { id: `https://openalex.org/${targetId}`, display_name: "Sang Hyun Lee", orcid: null },
        institutions: [{
          id: institution === "Korea University" ? "https://openalex.org/I197347611" : "https://openalex.org/I999",
          display_name: institution,
        }],
        raw_affiliation_strings: [institution],
      },
    ],
    primary_topic: {
      display_name: topic,
      subfield: { display_name: topic },
      field: { display_name: "Engineering" },
      domain: { display_name: "Physical Sciences" },
    },
    topics: [],
    concepts: [],
  };
}

async function fixture(
  secondaryOpenAlexAuthorIds: string[] = [],
  authorOverrides: Partial<AuthorConfig> = {},
) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "lics-publications-test-"));
  const publicationsPath = path.join(directory, "publications.json");
  const authorsPath = path.join(directory, "authors.json");
  const data: PublicationsData = {
    updatedAt: "2026-01-01T00:00:00.000Z",
    papers: [structuredClone(existingPaper)],
    patents: [],
  };
  await writeFile(publicationsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await writeFile(
    authorsPath,
    `${JSON.stringify([{ ...author, secondaryOpenAlexAuthorIds, ...authorOverrides }], null, 2)}\n`,
    "utf8",
  );
  return { directory, publicationsPath, authorsPath, data };
}

test("adds historical verified and pending works while rejecting homonym pollution", async (t) => {
  const files = await fixture();
  t.after(() => rm(files.directory, { recursive: true, force: true }));
  const works = [
    candidate({
      id: "W-verified",
      title: "Historical Wireless Network Optimization",
      coauthors: ["Hong Ki Kim"],
      topic: "Advanced Wireless Communication",
    }),
    candidate({
      id: "W-pending",
      title: "Probabilistic Link Adaptation",
      institution: "Samsung Electronics",
      topic: "Advanced MIMO Systems Optimization",
    }),
    candidate({
      id: "W-rejected",
      title: "Interacting dark energy constraints",
      institution: "Jet Propulsion Laboratory",
      topic: "Astronomy and Dark Energy",
    }),
  ];

  const summary = await runPublicationUpdate({
    publicationsPath: files.publicationsPath,
    authorsPath: files.authorsPath,
    currentMemberNames: [],
    fetchWorks: async () => works,
    now: () => new Date("2026-08-11T00:00:00.000Z"),
    logger: silentLogger,
  });
  const updated = JSON.parse(await readFile(files.publicationsPath, "utf8")) as PublicationsData;

  assert.deepEqual(summary, {
    fetched: 3,
    duplicates: 0,
    rejected: 1,
    addedVerified: 1,
    addedPending: 1,
    changed: true,
  });
  assert.deepEqual(updated.papers[0], files.data.papers[0]);
  assert.deepEqual(updated.papers.slice(1).map((paper) => paper.status), ["verified", "pending"]);
  assert.equal(updated.updatedAt, "2026-08-11T00:00:00.000Z");
});

test("supports multiple author IDs, deduplicates their shared work, and is idempotent", async (t) => {
  const files = await fixture(["A9999999999"]);
  t.after(() => rm(files.directory, { recursive: true, force: true }));
  const shared = candidate({
    id: "W-shared",
    title: "Historical Wireless Network Optimization",
    coauthors: ["Hong Ki Kim"],
    topic: "Advanced Wireless Communication",
  });
  const fetchWorks = async (_author: AuthorConfig, authorId: string) => [
    authorId === "A9999999999"
      ? candidate({
          id: "W-shared",
          title: shared.title,
          targetId: "A9999999999",
          topic: "Advanced Wireless Communication",
          coauthors: ["Hong Ki Kim"],
        })
      : shared,
  ];

  const first = await runPublicationUpdate({
    publicationsPath: files.publicationsPath,
    authorsPath: files.authorsPath,
    currentMemberNames: [],
    fetchWorks,
    now: () => new Date("2026-08-11T00:00:00.000Z"),
    logger: silentLogger,
  });
  const afterFirst = await readFile(files.publicationsPath, "utf8");
  const second = await runPublicationUpdate({
    publicationsPath: files.publicationsPath,
    authorsPath: files.authorsPath,
    currentMemberNames: [],
    fetchWorks,
    now: () => new Date("2026-08-12T00:00:00.000Z"),
    logger: silentLogger,
  });
  const afterSecond = await readFile(files.publicationsPath, "utf8");

  assert.equal(first.addedVerified, 1);
  assert.equal(first.duplicates, 1);
  assert.equal(second.changed, false);
  assert.equal(second.duplicates, 2);
  assert.equal(afterSecond, afterFirst);
});

test("leaves publications.json byte-for-byte unchanged when a later OpenAlex request fails", async (t) => {
  const files = await fixture(["A8888888888"]);
  t.after(() => rm(files.directory, { recursive: true, force: true }));
  const before = await readFile(files.publicationsPath, "utf8");

  await assert.rejects(
    runPublicationUpdate({
      publicationsPath: files.publicationsPath,
      authorsPath: files.authorsPath,
      currentMemberNames: [],
      fetchWorks: async (_config, authorId) => {
        if (authorId === "A8888888888") throw new Error("injected OpenAlex failure");
        return [candidate({
          id: "W-before-failure",
          title: "Historical Wireless Network Optimization",
          coauthors: ["Hong Ki Kim"],
          topic: "Advanced Wireless Communication",
        })];
      },
      logger: silentLogger,
    }),
    /injected OpenAlex failure/,
  );

  assert.equal(await readFile(files.publicationsPath, "utf8"), before);
  assert.deepEqual((await readdir(files.directory)).sort(), ["authors.json", "publications.json"]);
});

test("skips a configured translated duplicate OpenAlex work", async (t) => {
  const files = await fixture([], {
    knownDuplicateOpenAlexWorkIds: ["W9999999999"],
  } as Partial<AuthorConfig>);
  t.after(() => rm(files.directory, { recursive: true, force: true }));

  const summary = await runPublicationUpdate({
    publicationsPath: files.publicationsPath,
    authorsPath: files.authorsPath,
    currentMemberNames: [],
    fetchWorks: async () => [candidate({
      id: "W9999999999",
      title: "無線センサネットワークの翻訳メタデータ",
      coauthors: ["Hong Ki Kim"],
      topic: "Advanced Wireless Communication",
      year: 2026,
      venue: "IEEE Communications Magazine",
    })],
    logger: silentLogger,
  });

  assert.equal(summary.changed, false);
  assert.equal(summary.duplicates, 1);
  assert.equal((JSON.parse(await readFile(files.publicationsPath, "utf8")) as PublicationsData).papers.length, 1);
});

test("does not skip an allowlisted work when its metadata no longer matches", async (t) => {
  const files = await fixture([], {
    knownDuplicateOpenAlexWorkIds: ["W9999999999"],
  } as Partial<AuthorConfig>);
  t.after(() => rm(files.directory, { recursive: true, force: true }));

  const summary = await runPublicationUpdate({
    publicationsPath: files.publicationsPath,
    authorsPath: files.authorsPath,
    currentMemberNames: [],
    fetchWorks: async () => [candidate({
      id: "W9999999999",
      title: "Historical Wireless Network Optimization",
      topic: "Advanced Wireless Communication",
    })],
    logger: silentLogger,
  });

  assert.equal(summary.changed, true);
  assert.equal(summary.duplicates, 0);
  assert.equal(summary.addedPending, 1);
  assert.equal((JSON.parse(await readFile(files.publicationsPath, "utf8")) as PublicationsData).papers.length, 2);
});

test("rejects an invalid nested paper without fetching or changing the file", async (t) => {
  const files = await fixture();
  t.after(() => rm(files.directory, { recursive: true, force: true }));
  const invalid = {
    ...files.data,
    papers: [{ ...files.data.papers[0], status: "published" }],
  };
  const before = `${JSON.stringify(invalid, null, 2)}\n`;
  await writeFile(files.publicationsPath, before, "utf8");
  let fetched = false;

  await assert.rejects(
    runPublicationUpdate({
      publicationsPath: files.publicationsPath,
      authorsPath: files.authorsPath,
      fetchWorks: async () => {
        fetched = true;
        return [];
      },
      logger: silentLogger,
    }),
    /invalid top-level shape/,
  );

  assert.equal(fetched, false);
  assert.equal(await readFile(files.publicationsPath, "utf8"), before);
});

test("rejects an invalid nested patent without changing the file", async (t) => {
  const files = await fixture();
  t.after(() => rm(files.directory, { recursive: true, force: true }));
  const invalid = { ...files.data, patents: [{}] };
  const before = `${JSON.stringify(invalid, null, 2)}\n`;
  await writeFile(files.publicationsPath, before, "utf8");

  await assert.rejects(
    runPublicationUpdate({
      publicationsPath: files.publicationsPath,
      authorsPath: files.authorsPath,
      fetchWorks: async () => [],
      logger: silentLogger,
    }),
    /invalid top-level shape/,
  );

  assert.equal(await readFile(files.publicationsPath, "utf8"), before);
});

test("removes its temporary file when the atomic rename fails", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "lics-publications-write-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const targetDirectory = path.join(directory, "publications.json");
  await mkdir(targetDirectory);

  await assert.rejects(
    writePublicationsAtomically(targetDirectory, {
      updatedAt: "2026-08-11T00:00:00.000Z",
      papers: [],
      patents: [],
    }),
  );

  assert.deepEqual(await readdir(directory), ["publications.json"]);
});
