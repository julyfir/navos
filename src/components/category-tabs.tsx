"use client";

import { motion } from "framer-motion";

export interface CategoryTab {
  id: string | null;
  name: string;
}

export function CategoryTabs({
  categories,
  activeId,
  onChange,
}: {
  categories: CategoryTab[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => {
        const active = cat.id === activeId;
        return (
          <button
            key={cat.id ?? "all"}
            onClick={() => onChange(active ? null : cat.id)}
            className="relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {active && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-blue-600/90 shadow-md shadow-blue-600/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative ${active ? "text-white" : ""}`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}