"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Cat {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export function SortableCat({ cat, onEdit, onDelete }: {
  cat: Cat;
  onEdit: (c: Cat) => void;
  onDelete: (c: Cat) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="glass flex items-center gap-3 rounded-2xl p-4"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-400" aria-label="拖拽排序">
        <GripVertical className="h-4 w-4" />
      </button>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
      >
        {cat.icon}
      </span>
      <div className="flex-1">
        <div className="font-medium">{cat.name}</div>
        <div className="text-xs text-neutral-500">{cat.count} 个网址</div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(cat)} aria-label="编辑">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(cat)} aria-label="删除">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}