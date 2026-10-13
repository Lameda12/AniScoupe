export type AudioTrack = "sub" | "dub";

/**
 * FrameXTV embed URL template. Placeholders:
 *   {id}    MyAnimeList id
 *   {ep}    episode number (1-based)
 *   {audio} "sub" | "dub"
 *
 * Override per deployment with NEXT_PUBLIC_STREAM_EMBED_TEMPLATE.
 * The default path is a placeholder: confirm it against https://framextv.xyz/api.
 */
const EMBED_TEMPLATE =
  process.env.NEXT_PUBLIC_STREAM_EMBED_TEMPLATE ?? "https://framextv.xyz/embed/anime/{id}/{ep}?audio={audio}";

export function buildEmbedUrl(malId: number, episode: number, audio: AudioTrack): string {
  return EMBED_TEMPLATE.replaceAll("{id}", String(malId))
    .replaceAll("{ep}", String(episode))
    .replaceAll("{audio}", audio);
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
