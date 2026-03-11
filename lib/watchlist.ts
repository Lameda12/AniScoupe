import { WatchlistItem } from "@/types/anime";

const KEY = "aniscope_watchlist";

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(item: WatchlistItem): void {
  const list = getWatchlist();
  const exists = list.find((i) => i.mal_id === item.mal_id);
  if (!exists) {
    list.push(item);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function removeFromWatchlist(mal_id: number): void {
  const list = getWatchlist().filter((i) => i.mal_id !== mal_id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function updateWatchStatus(
  mal_id: number,
  watchStatus: WatchlistItem["watchStatus"]
): void {
  const list = getWatchlist().map((i) =>
    i.mal_id === mal_id ? { ...i, watchStatus } : i
  );
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isInWatchlist(mal_id: number): boolean {
  return getWatchlist().some((i) => i.mal_id === mal_id);
}

export function getWatchlistCount(): number {
  return getWatchlist().length;
}
