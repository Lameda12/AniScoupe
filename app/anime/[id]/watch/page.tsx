import { getAnimeById, getEpisodeCount } from "@/lib/api";
import WatchPlayer from "@/components/WatchPlayer";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string; audio?: string }>;
}) {
  const [{ id }, { ep, audio }] = await Promise.all([params, searchParams]);

  let anime;
  try {
    anime = await getAnimeById(Number(id));
  } catch {
    notFound();
  }

  const episodeCount = await getEpisodeCount(anime);
  const total = Math.max(episodeCount, 1);
  const requested = Number.parseInt(ep ?? "1", 10);
  const initialEpisode = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), total) : 1;

  return (
    <WatchPlayer
      anime={anime}
      episodeCount={total}
      initialEpisode={initialEpisode}
      initialAudio={audio === "dub" ? "dub" : "sub"}
    />
  );
}
