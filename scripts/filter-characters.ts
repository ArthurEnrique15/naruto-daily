#!/usr/bin/env npx tsx
/**
 * Reads data/characters-raw.json (scraper output, unfiltered).
 * Applies game-eligibility rules.
 * Writes data/characters.json (game-ready).
 *
 * Usage: npm run filter-data
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { Character, RawCharacter } from "../src/types/character";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "../data");

const BORUTO_SENTINEL = "__boruto__";
const ALLOWED_SERIES = new Set(["naruto", "shippuden"]);

interface ArcEntry {
  id: string;
  name: string;
  manga_chapters: string;
  series: string;
  canonical: boolean;
}

function loadCanonArcNames(): Set<string> {
  const { arcs } = JSON.parse(
    readFileSync(resolve(dataDir, "canon-arcs.json"), "utf-8")
  ) as { arcs: ArcEntry[] };

  for (const arc of arcs) {
    if (arc.canonical && !ALLOWED_SERIES.has(arc.series)) {
      throw new Error(
        `canon-arcs.json: arc '${arc.id}' has canonical=true but series='${arc.series}'`
      );
    }
  }

  return new Set(arcs.filter((a) => a.canonical).map((a) => a.name));
}

type SkipReason = "boruto" | "filler" | "missing_data";

function filterCharacter(
  raw: RawCharacter,
  canonArcNames: Set<string>
): { character: Character } | { skipReason: SkipReason } {
  if (raw.debutArc === BORUTO_SENTINEL) return { skipReason: "boruto" };
  if (!raw.name) return { skipReason: "missing_data" };
  if (raw.status === null) return { skipReason: "missing_data" };
  if (raw.debutArc === null) return { skipReason: "missing_data" };
  if (!canonArcNames.has(raw.debutArc)) return { skipReason: "filler" };

  return {
    character: {
      id: raw.id,
      name: raw.name,
      imageUrl: raw.imageUrl,
      village: raw.village,
      rank: raw.rank as Character["rank"],
      kekkeiGenkai: raw.kekkeiGenkai,
      natureTypes: raw.natureTypes,
      jutsuTypes: raw.jutsuTypes,
      status: raw.status as Character["status"],
      debutArc: raw.debutArc,
      gender: raw.gender as Character["gender"],
      species: raw.species,
    },
  };
}

function main(): void {
  const rawData = JSON.parse(
    readFileSync(resolve(dataDir, "characters-raw.json"), "utf-8")
  ) as RawCharacter[];

  const canonArcNames = loadCanonArcNames();
  const characters: Character[] = [];
  const seenIds = new Set<string>();
  const counts = { boruto: 0, filler: 0, missing_data: 0, duplicate: 0 };

  for (const raw of rawData) {
    const result = filterCharacter(raw, canonArcNames);
    if ("skipReason" in result) {
      counts[result.skipReason]++;
      continue;
    }
    const { character } = result;
    if (seenIds.has(character.id)) {
      counts.duplicate++;
      continue;
    }
    seenIds.add(character.id);
    characters.push(character);
  }

  console.log(`Input:             ${rawData.length}`);
  console.log(`Skipped (boruto):  ${counts.boruto}`);
  console.log(`Skipped (filler):  ${counts.filler}`);
  console.log(`Skipped (missing): ${counts.missing_data}`);
  console.log(`Skipped (dup):     ${counts.duplicate}`);
  console.log(`Written:           ${characters.length}`);

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(
    resolve(dataDir, "characters.json"),
    JSON.stringify(characters, null, 2) + "\n"
  );
}

main();
