"use client";
import { Anime } from "@/types/anime";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import WatchlistButton from "@/components/WatchlistButton";
import Image from "next/image";
import { Star, Clock, Tv, Film } from "lucide-react";

interface Props {
  anime: Anime | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AnimeDetailDialog({ anime, open, onOpenChange }: Props) {
  if (!anime) return null;

  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    "/placeholder.png";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative h-48 md:h-64 overflow-hidden">
            <Image
              src={imageUrl}
              alt={anime.title}
              fill
              className="object-cover object-top blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-card" />
            <div className="absolute bottom-4 left-4 flex gap-3 items-end">
              <div className="relative w-24 h-36 rounded-md overflow-hidden border-2 border-indigo-500/50 shadow-xl">
                <Image src={imageUrl} alt={anime.title} fill className="object-cover" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-white tracking-wide text-left">
                    {anime.title_english || anime.title}
                  </DialogTitle>
                </DialogHeader>
                {anime.title !== (anime.title_english || anime.title) && (
                  <p className="text-sm text-muted-foreground mt-0.5">{anime.title}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              {anime.score && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-3 py-1.5">
                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                  <span className="text-yellow-400 font-semibold text-sm">{anime.score.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">/ 10</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md px-3 py-1.5">
                  <Tv size={14} className="text-indigo-400" />
                  <span className="text-indigo-400 text-sm">{anime.episodes} episodes</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1.5 bg-muted border border-border rounded-md px-3 py-1.5">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">{anime.duration}</span>
                </div>
              )}
              {anime.type && (
                <div className="flex items-center gap-1.5 bg-muted border border-border rounded-md px-3 py-1.5">
                  <Film size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">{anime.type}</span>
                </div>
              )}
            </div>

            {/* Score progress */}
            {anime.score && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Score</span>
                  <span>{anime.score} / 10</span>
                </div>
                <Progress value={(anime.score / 10) * 100} className="h-1.5 bg-muted" />
              </div>
            )}

            {/* Status */}
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

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g) => (
                    <Badge key={g.mal_id} variant="outline" className="border-indigo-500/30 text-indigo-400">
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Synopsis</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {/* Studios */}
            {anime.studios && anime.studios.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Studios</p>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((s) => (
                    <Badge key={s.mal_id} variant="secondary" className="text-xs">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Watchlist button */}
            <div className="pt-2">
              <WatchlistButton anime={anime} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
