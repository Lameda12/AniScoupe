"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Anime } from "@/types/anime";
import { searchAnime, getTopAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";

const STATUS_OPTIONS = ["", "airing", "complete", "upcoming"] as const;
const TYPE_OPTIONS = ["", "TV", "Movie", "OVA", "Special", "ONA"] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Load top anime initially
    getTopAnime().then(setResults);
  }, []);

  const doSearch = useCallback(async (q: string, s: string, t: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchAnime(q, s || undefined, t || undefined);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query, status, type);
  };

  const clear = () => {
    setQuery("");
    setSearched(false);
    getTopAnime().then(setResults);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-5xl text-white tracking-wider mb-2">SEARCH</h1>
        <p className="text-muted-foreground">Find your next obsession</p>
      </motion.div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime titles..."
            className="pl-10 pr-10 bg-card border-border/50 text-white placeholder:text-muted-foreground h-12 text-base focus-visible:ring-indigo-500"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 h-12 px-6">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Filter size={12} /> Status
          </p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <Badge
                key={s || "all"}
                onClick={() => { setStatus(s); if (query) doSearch(query, s, type); }}
                className={`cursor-pointer transition-all ${
                  status === s
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-transparent border-border text-muted-foreground hover:border-white/30 hover:text-white"
                }`}
                variant="outline"
              >
                {s || "All"}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Type</p>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map((t) => (
              <Badge
                key={t || "all"}
                onClick={() => { setType(t); if (query) doSearch(query, status, t); }}
                className={`cursor-pointer transition-all ${
                  type === t
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-transparent border-border text-muted-foreground hover:border-white/30 hover:text-white"
                }`}
                variant="outline"
              >
                {t || "All"}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {searched
            ? results.length > 0
              ? `${results.length} results for "${query}"`
              : `No results for "${query}"`
            : "Top Anime"}
        </p>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-3 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      ) : results.length === 0 && searched ? (
        <div className="text-center py-24">
          <p className="font-display text-4xl text-muted-foreground/30 mb-4">NO RESULTS</p>
          <p className="text-muted-foreground text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((anime, i) => (
            <AnimeCard key={anime.mal_id} anime={anime} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
