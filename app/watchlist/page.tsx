"use client";
import { useState, useEffect } from "react";
import { WatchlistItem } from "@/types/anime";
import { getWatchlist, removeFromWatchlist, updateWatchStatus } from "@/lib/watchlist";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Bookmark, Search, Star } from "lucide-react";

const STATUS_LABELS: Record<WatchlistItem["watchStatus"], string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
};

const STATUS_COLORS: Record<WatchlistItem["watchStatus"], string> = {
  plan_to_watch: "bg-muted text-muted-foreground border-border",
  watching: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  const handleRemove = (id: number) => {
    removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i.mal_id !== id));
    window.dispatchEvent(new Event("watchlist-updated"));
  };

  const handleStatusChange = (id: number, status: WatchlistItem["watchStatus"]) => {
    updateWatchStatus(id, status);
    setItems((prev) =>
      prev.map((i) => (i.mal_id === id ? { ...i, watchStatus: status } : i))
    );
  };

  const stats = {
    total: items.length,
    watching: items.filter((i) => i.watchStatus === "watching").length,
    completed: items.filter((i) => i.watchStatus === "completed").length,
    planned: items.filter((i) => i.watchStatus === "plan_to_watch").length,
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-5xl text-white tracking-wider mb-2">WATCHLIST</h1>
        <p className="text-muted-foreground">Your personal anime collection</p>
      </motion.div>

      {/* Stats */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Watching", value: stats.watching, color: "text-indigo-400" },
            { label: "Completed", value: stats.completed, color: "text-green-400" },
            { label: "Planned", value: stats.planned, color: "text-muted-foreground" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-card border-border/50 p-4 text-center">
              <p className={`font-display text-3xl ${color}`}>{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <Bookmark size={64} className="text-muted-foreground/20 mb-6" />
          <h2 className="font-display text-4xl text-muted-foreground/40 mb-3">EMPTY</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Your watchlist is empty. Start exploring to add anime you want to watch.
          </p>
          <div className="flex gap-3">
            <Link href="/search">
              <Button className="bg-indigo-500 hover:bg-indigo-600 gap-2">
                <Search size={16} /> Browse Anime
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" className="border-border hover:border-white/30">
                Discover
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.mal_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="bg-card border-border/50 overflow-hidden group card-glow">
                  <Link href={`/anime/${item.mal_id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={item.image_url || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {item.score && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/60 text-yellow-400 border-yellow-400/30 gap-1 text-xs">
                            <Star size={9} fill="currentColor" />
                            {item.score.toFixed(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 space-y-3">
                    <Link href={`/anime/${item.mal_id}`}>
                      <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.episodes && <span>{item.episodes} eps</span>}
                      {item.status && <span>· {item.status}</span>}
                    </div>

                    <Badge className={`text-xs ${STATUS_COLORS[item.watchStatus]}`} variant="outline">
                      {STATUS_LABELS[item.watchStatus]}
                    </Badge>

                    <div className="flex gap-2">
                      <Select
                        value={item.watchStatus}
                        onValueChange={(v) =>
                          handleStatusChange(item.mal_id, v as WatchlistItem["watchStatus"])
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-muted border-border flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                          <SelectItem value="watching">Watching</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleRemove(item.mal_id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
