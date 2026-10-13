import { getAnimeById, getEpisodeCount } from "@/lib/api";
import { getStreamTarget } from "@/lib/tmdb";
import WatchPlayer from "@/components/WatchPlayer";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const [{ id }, { ep }] = await Promise.all([params, searchParams]);

  let anime;
  try {
    anime = await getAnimeById(Number(id));
  } catch {
    notFound();
  }

  const target = getStreamTarget(anime.mal_id);
  const total = target?.kind === "movie" ? 1 : Math.max(await getEpisodeCount(anime), 1);
  const requested = Number.parseInt(ep ?? "1", 10);
  const initialEpisode = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), total) : 1;

  return <WatchPlayer anime={anime} target={target} episodeCount={total} initialEpisode={initialEpisode} />;
}
