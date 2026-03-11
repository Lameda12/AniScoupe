"use client";
import { AnimeChanQuote } from "@/types/anime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote } from "lucide-react";
import { useState } from "react";
import { getRandomQuote } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  initialQuote: AnimeChanQuote | null;
}

export default function QuoteCard({ initialQuote }: Props) {
  const [quote, setQuote] = useState<AnimeChanQuote | null>(initialQuote);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const q = await getRandomQuote();
      setQuote(q);
    } catch {
      // keep current
    } finally {
      setLoading(false);
    }
  };

  if (!quote) return null;

  return (
    <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-card p-6 md:p-8">
      <div className="absolute top-4 left-4 text-indigo-500/20">
        <Quote size={60} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.content}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <p className="text-lg md:text-xl text-white/90 italic leading-relaxed mb-4">
            &ldquo;{quote.content}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-400 font-semibold text-sm">{quote.character?.name}</p>
              <p className="text-muted-foreground text-xs">{quote.anime?.name}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={loading}
              className="text-muted-foreground hover:text-white gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              New quote
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
