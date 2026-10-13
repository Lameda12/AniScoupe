import { getAnimeById } from "@/lib/api";
import { getStreamTarget } from "@/lib/tmdb";
import AnimeDetailPage from "@/components/AnimeDetailPage";
import { notFound } from "next/navigation";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const anime = await getAnimeById(Number(id));
    return <AnimeDetailPage anime={anime} streamable={getStreamTarget(anime.mal_id) !== null} />;
  } catch {
    notFound();
  }
}
