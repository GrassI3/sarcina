"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const QUOTE_ROTATION_MS = 9000;

export function QuoteTicker() {
  const [quote, setQuote] = useState("Loading fresh focus quote...");

  useEffect(() => {
    let active = true;

    const fetchQuote = async () => {
      try {
        const response = await fetch("/api/meta/quote", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Quote request failed");
        }
        const payload = (await response.json()) as { quote?: string };
        if (active && payload.quote) {
          setQuote(payload.quote);
        }
      } catch {
        if (active) {
          setQuote("Stay in flow: one meaningful step at a time.");
        }
      }
    };

    fetchQuote();

    const timer = window.setInterval(() => {
      fetchQuote();
    }, QUOTE_ROTATION_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="glass-card px-4 py-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-black/6 via-transparent to-black/6 dark:from-white/6 dark:to-white/6 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <span className="mt-0.5 h-2 w-2 rounded-full bg-electric-blue shadow-[0_0_10px_var(--accent-electric-blue)]" />
        <div className="min-h-6 flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-sm text-foreground"
            >
              {quote}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
