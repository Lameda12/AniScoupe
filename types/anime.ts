export interface AnimeImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface AnimeImages {
  jpg: AnimeImage;
  webp: AnimeImage;
}

export interface AnimeTitle {
  type: string;
  title: string;
}

export interface AnimeGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeStudio {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeTrailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: AnimeImages;
  trailer: AnimeTrailer;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  titles: AnimeTitle[];
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  genres: AnimeGenre[];
  studios: AnimeStudio[];
  duration: string | null;
  rating: string | null;
  members: number | null;
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
}

export interface AnimeChanQuote {
  content: string;
  character: { name: string; about: string; image_url: string };
  anime: { id: number; name: string; image_url: string };
}

export interface WatchlistItem {
  mal_id: number;
  title: string;
  image_url: string;
  score: number | null;
  episodes: number | null;
  status: string | null;
  watchStatus: "plan_to_watch" | "watching" | "completed";
}

export interface AnimeFact {
  id: number;
  anime_name: string;
  fact: string;
}
