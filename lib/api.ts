import { Anime, AnimeChanQuote, AnimeFact } from "@/types/anime";
import {
  ANILIST_REVALIDATE,
  AniListMedia,
  AniListResponse,
  QueryName,
  Variables,
  postAniList,
  toAnime,
} from "@/lib/anilist";

const ANIMECHAN_BASE = "https://animechan.io/api/v1";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class AniListError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function callOnce<T>(name: QueryName, variables: Variables, viaProxy: boolean): Promise<T> {
  const res = viaProxy
    ? await fetch(`/api/anilist?q=${name}&v=${encodeURIComponent(JSON.stringify(variables))}`)
    : await postAniList(name, variables, { next: { revalidate: ANILIST_REVALIDATE } });
  const body = (await res.json().catch(() => null)) as AniListResponse<T> | null;
  if (res.ok && body?.data) return body.data;
  const message = body?.errors?.[0]?.message ?? `HTTP ${res.status}`;
  throw new AniListError(`AniList error: ${message}`, body?.errors?.[0]?.status ?? res.status);
}

/**
 * Run a named AniList query. In the browser the first attempt goes through our cached proxy
 * (app/api/anilist); any proxy failure falls through to AniList directly. 429/5xx/network errors
 * against AniList are retried with backoff.
 */
async function anilist<T>(name: QueryName, variables: Variables, attempts = 3): Promise<T> {
  const browser = typeof window !== "undefined";
  for (let attempt = 1; ; attempt++) {
    const viaProxy = browser && attempt === 1;
    try {
      return await callOnce<T>(name, variables, viaProxy);
    } catch (err) {
      const status = err instanceof AniListError ? err.status : 0;
      const retryable = viaProxy || status === 0 || status === 429 || status >= 500;
      if (!retryable || attempt >= attempts) throw err;
      if (!viaProxy) await sleep(1000 * attempt);
    }
  }
}

type ListResult = { Page: { media: AniListMedia[] } };

async function list(variables: Variables): Promise<Anime[]> {
  // Drop unset filters rather than sending explicit nulls.
  const set = Object.fromEntries(Object.entries(variables).filter(([, v]) => v != null && v !== ""));
  const data = await anilist<ListResult>("list", { page: 1, perPage: 20, ...set });
  return data.Page.media.map(toAnime).filter((a): a is Anime => a !== null);
}

const STATUS_FILTER: Record<string, string> = {
  airing: "RELEASING",
  complete: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
};

export async function searchAnime(query: string, status?: string, type?: string): Promise<Anime[]> {
  return list({
    search: query,
    status: status ? STATUS_FILTER[status] : null,
    format: type ? type.toUpperCase() : null,
    sort: ["SEARCH_MATCH"],
  });
}

export async function getTopAnime(): Promise<Anime[]> {
  return list({ sort: ["SCORE_DESC"] });
}

/** AniList has no random endpoint: pick a random entry from a random page of the 2,000 most popular. */
export async function getRandomAnime(): Promise<Anime> {
  const results = await list({ page: 1 + Math.floor(Math.random() * 40), perPage: 50, sort: ["POPULARITY_DESC"] });
  if (results.length === 0) throw new Error("No anime found");
  return results[Math.floor(Math.random() * results.length)];
}

export async function getAnimeById(malId: number): Promise<Anime> {
  const data = await anilist<{ Media: AniListMedia }>("media", { idMal: malId });
  const anime = toAnime(data.Media);
  if (!anime) throw new Error(`No anime for MAL id ${malId}`);
  return anime;
}

/** Episodes available to watch: aired so far for airing shows, otherwise the total. */
export function getEpisodeCount(anime: Anime): number {
  return anime.aired_episodes ?? anime.episodes ?? 0;
}

/** Highest-rated anime matching any of the given AniList genres. */
export async function getAnimeByGenre(genres: string[]): Promise<Anime[]> {
  return list({ genres, sort: ["SCORE_DESC"] });
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
