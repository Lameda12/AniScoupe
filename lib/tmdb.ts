import type { StreamTarget } from "@/lib/stream";
import malTmdb from "@/lib/data/mal-tmdb.json";

type MapEntry = { m: number } | { t: number; s?: number; o?: number };

// Server-only: keeps the ~180KB mapping out of client bundles.
const MAP = malTmdb as Record<string, MapEntry>;

/** Resolve a MAL id to a FrameXTV (TMDB) target. Regenerate the data with scripts/build_tmdb_map.py. */
export function getStreamTarget(malId: number): StreamTarget | null {
  const entry = MAP[String(malId)];
  if (!entry) return null;
  if ("m" in entry) return { kind: "movie", tmdbId: entry.m };
  return { kind: "tv", tmdbId: entry.t, season: entry.s ?? 1, offset: entry.o ?? 0 };
}
