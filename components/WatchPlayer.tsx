"use client";
import { Anime } from "@/types/anime";
import { AudioTrack, buildEmbedUrl, progressKey } from "@/lib/stream";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  anime: Anime;
  episodeCount: number;
  initialEpisode: number;
  initialAudio: AudioTrack;
}

const RANGE_SIZE = 100;

export default function WatchPlayer({ anime, episodeCount, initialEpisode, initialAudio }: Props) {
  const [episode, setEpisode] = useState(initialEpisode);
  const [audio, setAudio] = useState<AudioTrack>(initialAudio);
  const [range, setRange] = useState(Math.floor((initialEpisode - 1) / RANGE_SIZE));

  const title = anime.title_english || anime.title;
  const rangeCount = Math.ceil(episodeCount / RANGE_SIZE);
  const rangeStart = range * RANGE_SIZE + 1;
  const rangeEnd = Math.min(rangeStart + RANGE_SIZE - 1, episodeCount);

  useEffect(() => {
    try {
      localStorage.setItem(progressKey(anime.mal_id), String(episode));
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("ep", String(episode));
    url.searchParams.set("audio", audio);
    window.history.replaceState(null, "", url);
  }, [anime.mal_id, episode, audio]);

  const goTo = (ep: number) => {
    const next = Math.min(Math.max(ep, 1), episodeCount);
    setEpisode(next);
    setRange(Math.floor((next - 1) / RANGE_SIZE));
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      <Link href={`/anime/${anime.mal_id}`}>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-2 mb-4">
          <ArrowLeft size={16} /> {title}
        </Button>
      </Link>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/50 bg-black shadow-2xl shadow-indigo-500/10">
        <iframe
          key={`${episode}-${audio}`}
          src={buildEmbedUrl(anime.mal_id, episode, audio)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          title={`${title} episode ${episode}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide leading-tight">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Episode {episode} of {episodeCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["sub", "dub"] as const).map((track) => (
              <button
                key={track}
                onClick={() => setAudio(track)}
                className={`px-4 py-1.5 text-sm font-semibold uppercase transition-colors ${
                  audio === track ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                {track}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => goTo(episode - 1)} disabled={episode <= 1} aria-label="Previous episode">
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(episode + 1)}
            disabled={episode >= episodeCount}
            aria-label="Next episode"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="font-display text-2xl text-white tracking-wider">EPISODES</h2>
          {anime.airing && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Airing</Badge>}
        </div>

        {rangeCount > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: rangeCount }, (_, i) => {
              const start = i * RANGE_SIZE + 1;
              const end = Math.min(start + RANGE_SIZE - 1, episodeCount);
              return (
                <button
                  key={i}
                  onClick={() => setRange(i)}
                  className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                    range === i
                      ? "border-indigo-500 text-indigo-300 bg-indigo-500/10"
                      : "border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  {start}-{end}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i).map((ep) => (
            <button
              key={ep}
              onClick={() => goTo(ep)}
              className={`h-10 rounded-md text-sm font-medium border transition-colors ${
                ep === episode
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "bg-muted/40 border-border text-muted-foreground hover:border-indigo-500/50 hover:text-white"
              }`}
            >
              {ep}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
