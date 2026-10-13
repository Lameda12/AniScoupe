import { Anime, AnimeChanQuote, AnimeFact, JikanResponse } from "@/types/anime";

export const JIKAN_BASE = "https://api.jikan.moe/v4";
export const JIKAN_REVALIDATE = 900; // seconds

// Browser calls try our cached proxy (app/api/jikan) first, then fall back to Jikan directly on retries.
const jikanBase = (attempt: number) => (typeof window === "undefined" || attempt > 1 ? JIKAN_BASE : "/api/jikan");

const ANIMECHAN_BASE = "https://animechan.io/api/v1";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Jikan rate-limits at 3 req/s and 60 req/min and has frequent 5xx blips, so retry those with backoff.
async function jikanFetch<T>(path: string, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    let status = 0;
    try {
      const res = await fetch(`${jikanBase(attempt)}${path}`, { next: { revalidate: JIKAN_REVALIDATE } });
      if (res.ok) return await res.json();
      status = res.status;
    } catch (err) {
      if (attempt >= attempts) throw err;
    }
    const viaProxy = jikanBase(attempt) !== JIKAN_BASE;
    // Any proxy failure falls straight through to Jikan; only back off between direct Jikan attempts.
    const retryable = viaProxy || status === 0 || status === 429 || status >= 500;
    if (!retryable || attempt >= attempts) throw new Error(`Jikan API error: ${status}`);
    if (!viaProxy) await sleep(1000 * attempt);
  }
}

export async function searchAnime(query: string, status?: string, type?: string): Promise<Anime[]> {
  let path = `/anime?q=${encodeURIComponent(query)}&limit=20`;
  if (status) path += `&status=${status}`;
  if (type) path += `&type=${type.toLowerCase()}`;
  const data = await jikanFetch<JikanResponse<Anime[]>>(path);
  return data.data;
}

export async function getTopAnime(): Promise<Anime[]> {
  const data = await jikanFetch<JikanResponse<Anime[]>>("/top/anime?limit=20");
  return data.data;
}

export async function getRandomAnime(): Promise<Anime> {
  const data = await jikanFetch<JikanResponse<Anime>>("/random/anime");
  return data.data;
}

export async function getAnimeById(id: number): Promise<Anime> {
  const data = await jikanFetch<JikanResponse<Anime>>(`/anime/${id}`);
  return data.data;
}

/** Episode count for an anime. Falls back to Jikan's episode list for airing shows where `episodes` is null. */
export async function getEpisodeCount(anime: Anime): Promise<number> {
  if (anime.episodes) return anime.episodes;
  try {
    const first = await jikanFetch<JikanResponse<unknown[]>>(`/anime/${anime.mal_id}/episodes`);
    const lastPage = first.pagination?.last_visible_page ?? 1;
    if (lastPage <= 1) return first.data.length;
    const last = await jikanFetch<JikanResponse<unknown[]>>(`/anime/${anime.mal_id}/episodes?page=${lastPage}`);
    return (lastPage - 1) * 100 + last.data.length;
  } catch {
    return 0;
  }
}

export async function getAnimeByGenre(genreIds: number[]): Promise<Anime[]> {
  const genres = genreIds.join(",");
  const data = await jikanFetch<JikanResponse<Anime[]>>(`/anime?genres=${genres}&limit=20&order_by=score&sort=desc`);
  return data.data;
}

export async function getRandomQuote(): Promise<AnimeChanQuote> {
  const res = await fetch(`${ANIMECHAN_BASE}/quotes/random`, { cache: "no-store" });
  if (!res.ok) throw new Error("AnimeChan error");
  return res.json();
}

export async function getAnimeFacts(): Promise<AnimeFact[]> {
  try {
    const res = await fetch("https://anime-facts-rest-api.herokuapp.com/api/v1", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}
