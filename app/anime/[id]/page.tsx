import { getAnimeById } from "@/lib/api";
import AnimeDetailPage from "@/components/AnimeDetailPage";
import { notFound } from "next/navigation";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const anime = await getAnimeById(Number(id));
    return <AnimeDetailPage anime={anime} />;
  } catch {
    notFound();
  }
}
