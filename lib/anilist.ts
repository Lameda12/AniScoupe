import { Anime } from "@/types/anime";

export const ANILIST_URL = "https://graphql.anilist.co";
export const ANILIST_REVALIDATE = 900; // seconds

const MEDIA_FIELDS = `
  id idMal
  title { romaji english native }
  synonyms
  coverImage { extraLarge large medium }
  trailer { id site }
  format source episodes status averageScore popularity
  rankings { rank type allTime }
  description(asHtml: false)
  season seasonYear genres duration
  studios(isMain: true) { nodes { id name } }
  nextAiringEpisode { episode }
`;

/** Named queries. The proxy route only runs these, so it can't be used as an open GraphQL proxy. */
export const QUERIES = {
  media: `query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { ${MEDIA_FIELDS} } }`,
  list: `query ($page: Int, $perPage: Int, $search: String, $status: MediaStatus, $format: MediaFormat, $genres: [String], $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, isAdult: false, search: $search, status: $status, format: $format, genre_in: $genres, sort: $sort) { ${MEDIA_FIELDS} }
    }
  }`,
} as const;

export type QueryName = keyof typeof QUERIES;
export type Variables = Record<string, string | number | string[] | null | undefined>;

export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null; native: string | null };
  synonyms: string[] | null;
  coverImage: { extraLarge: string | null; large: string | null; medium: string | null };
  trailer: { id: string; site: string } | null;
  format: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  averageScore: number | null;
  popularity: number | null;
  rankings: { rank: number; type: "RATED" | "POPULAR"; allTime: boolean }[] | null;
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  duration: number | null;
  studios: { nodes: { id: number; name: string }[] } | null;
  nextAiringEpisode: { episode: number } | null;
}

export interface AniListResponse<T> {
  data: T | null;
  errors?: { message: string; status?: number }[];
}

export function postAniList(name: QueryName, variables: Variables, init?: RequestInit & { next?: { revalidate: number } }) {
  return fetch(ANILIST_URL, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERIES[name], variables }),
  });
}

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

const STATUS_LABELS: Record<string, string> = {
  RELEASING: "Currently Airing",
  FINISHED: "Finished Airing",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "On Hiatus",
};

const TRAILER_EMBEDS: Record<string, (id: string) => string> = {
  youtube: (id) => `https://www.youtube.com/embed/${id}`,
  dailymotion: (id) => `https://www.dailymotion.com/embed/video/${id}`,
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replaceAll("_", " ");

function cleanDescription(html: string | null): string | null {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Map an AniList media into the app's Anime shape. Returns null for entries with no MAL id (app routes are MAL-keyed). */
export function toAnime(m: AniListMedia): Anime | null {
  if (!m.idMal) return null;
  const cover = m.coverImage.extraLarge ?? m.coverImage.large ?? m.coverImage.medium ?? "";
  const image = { image_url: m.coverImage.large ?? cover, small_image_url: m.coverImage.medium ?? cover, large_image_url: cover };
  const embed = m.trailer && TRAILER_EMBEDS[m.trailer.site];
  const rank = (type: "RATED" | "POPULAR") => m.rankings?.find((r) => r.type === type && r.allTime)?.rank ?? null;

  return {
    mal_id: m.idMal,
    url: `https://anilist.co/anime/${m.id}`,
    images: { jpg: image, webp: image },
    trailer: {
      youtube_id: m.trailer?.site === "youtube" ? m.trailer.id : null,
      url: m.trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${m.trailer.id}` : null,
      embed_url: embed ? embed(m.trailer!.id) : null,
    },
    title: m.title.romaji,
    title_english: m.title.english,
    title_japanese: m.title.native,
    titles: (m.synonyms ?? []).map((title) => ({ type: "Synonym", title })),
    type: m.format ? (FORMAT_LABELS[m.format] ?? m.format) : null,
    source: m.source ? titleCase(m.source) : null,
    episodes: m.episodes,
    aired_episodes: m.nextAiringEpisode ? m.nextAiringEpisode.episode - 1 : null,
    status: m.status ? (STATUS_LABELS[m.status] ?? m.status) : null,
    airing: m.status === "RELEASING",
    score: m.averageScore ? m.averageScore / 10 : null,
    scored_by: null,
    rank: rank("RATED"),
    popularity: rank("POPULAR"),
    synopsis: cleanDescription(m.description),
    background: null,
    season: m.season?.toLowerCase() ?? null,
    year: m.seasonYear,
    genres: (m.genres ?? []).map((name, i) => ({
      mal_id: i,
      type: "anime",
      name,
      url: `https://anilist.co/search/anime/${encodeURIComponent(name)}`,
    })),
    studios: (m.studios?.nodes ?? []).map((s) => ({
      mal_id: s.id,
      type: "anime",
      name: s.name,
      url: `https://anilist.co/studio/${s.id}`,
    })),
    duration: m.duration ? `${m.duration} min per ep` : null,
    rating: null,
    members: m.popularity,
  };
}
