"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { SearchBar } from "./search-bar";
import { CategoryTabs, type CategoryTab } from "./category-tabs";
import { SiteCard, type SiteCardData } from "./site-card";

export function HomeClient({
  isLoggedIn,
  initCatgs,
  initWebsites,
}: {
  isLoggedIn: boolean;
  initCatgs: CategoryTab[];
  initWebsites: SiteCardData[];
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initWebsites.filter((w) => {
      if (activeCat && w.categoryId !== activeCat) return false;
      if (!q) return true;
      return (
        w.title.toLowerCase().includes(q) ||
        w.url.toLowerCase().includes(q) ||
        (w.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, activeCat, initWebsites]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <header className="relative pt-16 pb-10 text-center">
        <Link
          href={isLoggedIn ? "/admin" : "/login"}
          className="glass absolute top-8 right-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          {isLoggedIn ? (
            <>
              <LayoutDashboard className="h-4 w-4" />
              后台管理
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              登录
            </>
          )}
        </Link>
        <h1 className="mb-6 bg-gradient-to-b from-neutral-800 to-neutral-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-white dark:to-neutral-500">
          NavOS
        </h1>
        <SearchBar onQuery={setQuery} />
      </header>
      <CategoryTabs
        categories={initCatgs}
        activeId={activeCat}
        onChange={setActiveCat}
      />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((w, i) => (
          <SiteCard key={w.id} site={w} index={i} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-16 text-center text-sm text-neutral-400">
          {query ? "没有匹配的网址" : "还没有网址，去后台添加吧"}
        </p>
      )}
    </div>
  );
}