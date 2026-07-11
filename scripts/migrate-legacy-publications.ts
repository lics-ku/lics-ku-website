import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createLegacyPublicationsData, legacyCounts } from "../data/publications/legacy";

const target = path.join(process.cwd(), "data", "publications", "publications.json");

async function main(): Promise<void> {
  await writeFile(target, `${JSON.stringify(createLegacyPublicationsData(), null, 2)}\n`, "utf8");
  console.log(`Migrated legacy publications to ${target}`);
  console.log(JSON.stringify(legacyCounts));
}

main().catch((error: unknown) => {
  console.error("Legacy migration failed.", error);
  process.exitCode = 1;
});
