"use client";
import { useState, useEffect } from "react";
import { Anime, AnimeChanQuote } from "@/types/anime";
import { getRandomAnime, getAnimeByGenre, getRandomQuote } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimeDetailDialog from "@/components/AnimeDetailDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Zap, Moon, Skull, Laugh, Quote } from "lucide-react";

const MOODS = [
  { key: "hype", label: "Hype", icon: Zap, genres: [1, 2, 4], color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30" },
  { key: "chill", label: "Chill", icon: Moon, genres: [36, 13, 22], color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30" },
  { key: "dark", label: "Dark", icon: Skull, genres: [14, 37, 7], color: "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30" },
  { key: "funny", label: "Funny", icon: Laugh, genres: [4, 9, 15], color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" },
] as const;

export default function DiscoverPage() {
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [moodResults, setMoodResults] = useState<Anime[]>([]);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [loadingMood, setLoadingMood] = useState(false);
  const [quote, setQuote] = useState<AnimeChanQuote | null>(null);

  useEffect(() => {
    getRandomQuote().then(setQuote).catch(() => {});
  }, []);

  const spin = async () => {
    setSpinning(true);
    try {
      const anime = await getRandomAnime();
      setRandomAnime(anime);
      setTimeout(() => {
        setDialogOpen(true);
        setSpinning(false);
      }, 1200);
    } catch {
      setSpinning(false);
    }
  };

  const selectMood = async (mood: typeof MOODS[number]) => {
    setActiveMood(mood.key);
    setLoadingMood(true);
    try {
      const data = await getAnimeByGenre([...mood.genres]);
      setMoodResults(data);
    } catch {
      setMoodResults([]);
    } finally {
      setLoadingMood(false);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-5xl text-white tracking-wider mb-2">DISCOVER</h1>
        <p className="text-muted-foreground">Explore by mood or take a chance with a random pick</p>
      </motion.div>

      {/* Spin the wheel */}
      <section className="mb-12">
        <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-card p-8 md:p-12 text-center">
          <div className="absolute inset-0 grid-lines opacity-50" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider mb-3">
              SPIN THE WHEEL
            </h2>
            <p className="text-muted-foreground mb-8">Let fate decide your next anime</p>
            <AnimatePresence mode="wait">
              {spinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: [0, 360, 720] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mb-6"
                >
                  <Shuffle size={48} className="text-indigo-400/50" />
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={spin}
              disabled={spinning}
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-600 text-white gap-3 px-8 py-6 text-lg font-semibold"
            >
              <Shuffle size={20} />
              {spinning ? "Finding..." : "Pick Random Anime"}
            </Button>
          </div>
        </Card>
      </section>

      {/* Quote of the day */}
      {quote && (
        <section className="mb-12">
          <h2 className="font-display text-2xl text-white tracking-wider mb-4">QUOTE OF THE DAY</h2>
          <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-card p-6">
            <div className="flex gap-4">
              <Quote size={32} className="text-rose-500/40 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white/90 italic text-lg leading-relaxed mb-3">
                  &ldquo;{quote.content}&rdquo;
                </p>
                <p className="text-rose-400 text-sm font-semibold">{quote.character?.name}</p>
                <p className="text-muted-foreground text-xs">{quote.anime?.name}</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Mood filter */}
      <section>
        <h2 className="font-display text-2xl text-white tracking-wider mb-2">PICK YOUR MOOD</h2>
        <p className="text-muted-foreground text-sm mb-6">Find anime that matches your vibe</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.key}
                onClick={() => selectMood(mood)}
                variant="outline"
                className={`h-20 flex-col gap-2 text-base font-semibold border transition-all ${mood.color} ${
                  activeMood === mood.key ? "ring-2 ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <Icon size={24} />
                {mood.label}
              </Button>
            );
          })}
        </div>

        {/* Mood results */}
        {activeMood && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {MOODS.find((m) => m.key === activeMood)?.label} picks
            </p>
            {loadingMood ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] rounded-lg bg-muted" />
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {moodResults.map((anime, i) => (
                  <AnimeCard key={anime.mal_id} anime={anime} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <AnimeDetailDialog
        anime={randomAnime}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
