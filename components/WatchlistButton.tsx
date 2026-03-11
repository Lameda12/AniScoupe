"use client";
import { Anime } from "@/types/anime";
import { Button } from "@/components/ui/button";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist";
import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface Props {
  anime: Anime;
}

export default function WatchlistButton({ anime }: Props) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isInWatchlist(anime.mal_id));
  }, [anime.mal_id]);

  const toggle = () => {
    if (inList) {
      removeFromWatchlist(anime.mal_id);
      setInList(false);
    } else {
      addToWatchlist({
        mal_id: anime.mal_id,
        title: anime.title_english || anime.title,
        image_url:
          anime.images?.webp?.large_image_url ||
          anime.images?.jpg?.large_image_url ||
          "",
        score: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        watchStatus: "plan_to_watch",
      });
      setInList(true);
    }
    window.dispatchEvent(new Event("watchlist-updated"));
  };

  return (
    <Button
      onClick={toggle}
      className={
        inList
          ? "bg-rose-500 hover:bg-rose-600 text-white gap-2"
          : "bg-indigo-500 hover:bg-indigo-600 text-white gap-2"
      }
    >
      {inList ? (
        <>
          <BookmarkCheck size={16} />
          In Watchlist
        </>
      ) : (
        <>
          <Bookmark size={16} />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
