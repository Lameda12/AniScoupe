export type StreamTarget = { kind: "movie"; tmdbId: number } | { kind: "tv"; tmdbId: number; season: number; offset: number };

const FRAMEX_BASE = "https://framextv.xyz";

/**
 * TV embed template. Placeholders: {id} TMDB show id, {season}, {episode}.
 * The default is unverified: confirm against https://framextv.xyz/api, or override
 * with NEXT_PUBLIC_FRAMEX_TV_TEMPLATE.
 */
const TV_TEMPLATE =
  process.env.NEXT_PUBLIC_FRAMEX_TV_TEMPLATE ?? `${FRAMEX_BASE}/embed/tv/{id}/{season}/{episode}?autoplay=1&muted=0`;

/** Build the FrameXTV embed URL. `episode` is the MAL episode number (1-based). */
export function buildEmbedUrl(target: StreamTarget, episode: number): string {
  if (target.kind === "movie") return `${FRAMEX_BASE}/embed/${target.tmdbId}?autoplay=1&muted=0`;
  return TV_TEMPLATE.replaceAll("{id}", String(target.tmdbId))
    .replaceAll("{season}", String(target.season))
    .replaceAll("{episode}", String(episode + target.offset));
}

export const progressKey = (malId: number) => `aniscope-progress-${malId}`;

/** Last watched episode for an anime, or 1. Client-only. */
export function getSavedEpisode(malId: number): number {
  try {
    const saved = Number(localStorage.getItem(progressKey(malId)));
    return saved >= 1 ? saved : 1;
  } catch {
    return 1;
  }
}
