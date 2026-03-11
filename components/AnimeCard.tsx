"use client";
import { Anime } from "@/types/anime";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Tv } from "lucide-react";

interface Props {
  anime: Anime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: Props) {
  const imageUrl =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    "/placeholder.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/anime/${anime.mal_id}`}>
        <Card className="group relative overflow-hidden bg-card border-border/50 card-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={anime.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {anime.score && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/60 text-yellow-400 border-yellow-400/30 backdrop-blur-sm gap-1">
                  <Star size={10} fill="currentColor" />
                  {anime.score.toFixed(1)}
                </Badge>
              </div>
            )}
            {anime.type && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-indigo-500/80 text-white border-0 backdrop-blur-sm gap-1 text-xs">
                  <Tv size={10} />
                  {anime.type}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
              {anime.title_english || anime.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {anime.episodes && <span>{anime.episodes} eps</span>}
              {anime.episodes && anime.status && <span>·</span>}
              {anime.status && (
                <span
                  className={
                    anime.status === "Currently Airing"
                      ? "text-green-400"
                      : "text-muted-foreground"
                  }
                >
                  {anime.status}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
