import { Anime, AnimeChanQuote, AnimeFact, JikanResponse } from "@/types/anime";

const JIKAN_BASE = "https://api.jikan.moe/v4";
const ANIMECHAN_BASE = "https://animechan.io/api/v1";

async function jikanFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${JIKAN_BASE}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  return res.json();
}

export async function searchAnime(query: string, status?: string, type?: string): Promise<Anime[]> {
  let path = `/anime?q=${encodeURIComponent(query)}&limit=20`;
  if (status) path += `&status=${status}`;
  if (type) path += `&type=${type}`;
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
