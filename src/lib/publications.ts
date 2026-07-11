/**
 * Publications adapter — single seam between the UI and the data pipeline.
 *
 * Delegates to the validated loader in `data/publications/loadPublications`,
 * which reads the generated `publications.json` (OpenAlex pipeline output) and
 * safely falls back to the legacy hand-maintained arrays if the JSON is
 * missing or malformed. UI code should only ever import from this module.
 */
import type { PublicationsData } from "@data/publications/schema";
import { loadPublications } from "@data/publications/loadPublications";

/**
 * Review policy: auto-collected `pending` entries stay private until a person
 * verifies them (docs/PUBLICATIONS.md). Only `verified` papers are rendered.
 */
export async function getPublicationsData(): Promise<PublicationsData> {
  const data = loadPublications();
  return {
    ...data,
    papers: data.papers.filter((paper) => paper.status === "verified"),
  };
}
