"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTimeOfDayQuotes } from "@/lib/quotes";

const QUOTE_ROTATION_MS = 9000;

export function QuoteTicker() {
  const quotes = useMemo(() => getTimeOfDayQuotes(), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, QUOTE_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [quotes]);

  return (
    <section className="glass-card px-4 py-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-lime-300/5 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--accent-electric-blue)] shadow-[0_0_10px_var(--accent-electric-blue)]" />
        <div className="min-h-[24px] flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={quotes[index]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-sm text-foreground/90"
            >
              {quotes[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
