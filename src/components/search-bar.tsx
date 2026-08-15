"use client";

import { Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { recordSearch } from "@/app/actions/tracking-actions";

export function SearchBar({
  onQuery,
}: {
  onQuery: (q: string) => void;
}) {
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      onQuery(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (next.trim()) void recordSearch(next);
      }, 800);
    },
    [onQuery],
  );

  return (
    <div className="glass-strong mx-auto flex max-w-xl items-center gap-3 rounded-full px-5 py-3.5 shadow-lg">
      <Search className="h-5 w-5 text-neutral-400" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="搜索网址…"
        className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
      />
    </div>
  );
}