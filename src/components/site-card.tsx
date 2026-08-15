"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { recordVisit, toggleFav } from "@/app/actions/tracking-actions";

export interface SiteCardData {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  categoryId?: string | null;
  favorited: boolean;
}

export function SiteCard({ site, index }: { site: SiteCardData; index: number }) {
  const [fav, setFav] = useState(site.favorited);

  function handleOpen() {
    void recordVisit(site.id);
    window.open(site.url, "_blank", "noopener,noreferrer");
  }

  async function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const on = await toggleFav(site.id);
    setFav(on);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.03 }}
      whileHover={{ y: -4 }}
    >
      <a
        href={site.url}
        onClick={handleOpen}
        className="glass group relative flex flex-col gap-3 rounded-3xl p-5 shadow-sm transition-shadow hover:shadow-xl"
      >
        <button
          onClick={handleFav}
          aria-label={fav ? "取消收藏" : "收藏"}
          className={`absolute right-4 top-4 rounded-full p-1.5 transition-colors ${
            fav ? "text-amber-400" : "text-neutral-300 hover:text-neutral-400"
          }`}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
        <div className="flex items-center gap-3">
          {site.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.iconUrl}
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-xs font-bold text-blue-600">
              {(site.title[0] ?? "?").toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-semibold">{site.title}</span>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {site.description || new URL(site.url).hostname}
        </p>
      </a>
    </motion.div>
  );
}