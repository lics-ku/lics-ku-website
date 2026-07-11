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

export async function getPublicationsData(): Promise<PublicationsData> {
  return loadPublications();
}
