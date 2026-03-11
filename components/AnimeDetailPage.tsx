"use client";
import { Anime } from "@/types/anime";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import WatchlistButton from "@/components/WatchlistButton";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Tv, Clock, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  anime: Anime;
}

export default function AnimeDetailPage({ anime }: Props) {
  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    "/placeholder.png";

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src={imageUrl}
          alt={anime.title}
          fill
          className="object-cover object-top blur-md scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0a0a0f]/70 to-[#0a0a0f]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-2 mb-6">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0"
          >
            <div className="relative w-44 h-64 md:w-52 md:h-72 rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
              <Image src={imageUrl} alt={anime.title} fill className="object-cover" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-5"
          >
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide leading-tight">
                {anime.title_english || anime.title}
              </h1>
              {anime.title !== (anime.title_english || anime.title) && (
                <p className="text-muted-foreground mt-1">{anime.title}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {anime.score && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                  <Star size={16} className="text-yellow-400" fill="currentColor" />
                  <span className="text-yellow-400 font-bold">{anime.score.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">/ 10</span>
                </div>
              )}
              {anime.members && (
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{(anime.members / 1000).toFixed(0)}k members</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-2">
                  <Tv size={16} className="text-indigo-400" />
                  <span className="text-sm text-indigo-400">{anime.episodes} eps</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{anime.duration}</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{anime.year}</span>
                </div>
              )}
            </div>

            {/* Score progress */}
            {anime.score && (
              <div className="max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>MAL Score</span>
                  <span>{anime.score} / 10</span>
                </div>
                <Progress value={(anime.score / 10) * 100} className="h-2 bg-muted" />
              </div>
            )}

            {/* Status + type */}
            <div className="flex gap-2 flex-wrap">
              {anime.status && (
                <Badge
                  className={
                    anime.status === "Currently Airing"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {anime.status}
                </Badge>
              )}
              {anime.type && (
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                  {anime.type}
                </Badge>
              )}
              {anime.rating && (
                <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                  {anime.rating}
                </Badge>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Badge key={g.mal_id} className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            <WatchlistButton anime={anime} />
          </motion.div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Synopsis */}
        {anime.synopsis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl text-white tracking-wider mb-4">SYNOPSIS</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{anime.synopsis}</p>
          </motion.div>
        )}

        {/* Trailer */}
        {anime.trailer?.embed_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl text-white tracking-wider mb-4">TRAILER</h2>
            <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden border border-border/50">
              <iframe
                src={anime.trailer.embed_url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title="Trailer"
              />
            </div>
          </motion.div>
        )}

        {/* Studios */}
        {anime.studios && anime.studios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl text-white tracking-wider mb-4">STUDIOS</h2>
            <div className="flex flex-wrap gap-2">
              {anime.studios.map((s) => (
                <Badge key={s.mal_id} variant="secondary" className="text-sm px-4 py-1.5">
                  {s.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
