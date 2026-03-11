import { getTopAnime, getRandomQuote, getAnimeFacts } from "@/lib/api";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const [topAnime, quote, facts] = await Promise.allSettled([
    getTopAnime(),
    getRandomQuote(),
    getAnimeFacts(),
  ]);

  return (
    <HomeClient
      topAnime={topAnime.status === "fulfilled" ? topAnime.value : []}
      initialQuote={quote.status === "fulfilled" ? quote.value : null}
      facts={facts.status === "fulfilled" ? facts.value : []}
    />
  );
}
