"use client";
import { Anime, AnimeChanQuote, AnimeFact } from "@/types/anime";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuoteCard from "@/components/QuoteCard";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailDialog from "@/components/AnimeDetailDialog";
import { useState, useEffect } from "react";
import { getRandomAnime } from "@/lib/api";
import { Shuffle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  topAnime: Anime[];
  initialQuote: AnimeChanQuote | null;
  facts: AnimeFact[];
}

export default function HomeClient({ topAnime, initialQuote, facts }: Props) {
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [currentFact, setCurrentFact] = useState<AnimeFact | null>(
    facts.length > 0 ? facts[Math.floor(Math.random() * facts.length)] : null
  );

  useEffect(() => {
    if (facts.length === 0) return;
    const interval = setInterval(() => {
      const next = facts[Math.floor(Math.random() * facts.length)];
      setCurrentFact(next);
    }, 10000);
    return () => clearInterval(interval);
  }, [facts]);

  const handleRandomPick = async () => {
    setLoadingRandom(true);
    try {
      const anime = await getRandomAnime();
      setRandomAnime(anime);
      setDialogOpen(true);
    } catch {
      // handle error silently
    } finally {
      setLoadingRandom(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[75vh] flex items-center">
        <div className="absolute inset-0 grid-lines" />
        <div className="absolute inset-0 scanline" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-[#0a0a0f] to-rose-950/20" />

        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {currentFact && (
              <motion.div
                key={currentFact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-6"
              >
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs px-3 py-1.5 max-w-md line-clamp-1">
                  ✦ {currentFact.anime_name}: {currentFact.fact}
                </Badge>
              </motion.div>
            )}

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white leading-none tracking-wide mb-4">
              DISCOVER
              <br />
              <span className="text-indigo-500">ANIME</span>
              <span className="text-rose-500">.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              Your personal anime discovery hub. Search, track, and explore thousands of titles.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleRandomPick}
                disabled={loadingRandom}
                className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 px-6 py-5 text-base"
              >
                <Shuffle size={18} className={loadingRandom ? "animate-spin" : ""} />
                Random Pick
              </Button>
              <Link href="/search">
                <Button variant="outline" className="border-border hover:border-white/30 text-white gap-2 px-6 py-5 text-base">
                  Browse All
                  <ChevronRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <QuoteCard initialQuote={initialQuote} />
      </section>

      {/* Trending Now */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl text-white tracking-wider">TRENDING NOW</h2>
            <p className="text-muted-foreground text-sm mt-1">Top rated anime right now</p>
          </div>
          <Link href="/search">
            <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 gap-1">
              View all <ChevronRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {topAnime.slice(0, 15).map((anime, i) => (
              <div key={anime.mal_id} className="w-44 flex-shrink-0">
                <AnimeCard anime={anime} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimeDetailDialog
        anime={randomAnime}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
