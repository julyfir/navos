"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  addCategory,
  editCategory,
  removeCategory,
  reorderCategories,
} from "@/app/actions/category-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableCat, type Cat } from "./sortable-cat";

const COLORS = [
  "#007aff",
  "#34c759",
  "#ff9500",
  "#ff3b30",
  "#af52de",
  "#ffcc00",
  "#5ac8fa",
  "#8e8e93",
];

export function CategoriesClient({ cats }: { cats: Cat[] }) {
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [items, setItems] = useState<Cat[]>(cats);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState(COLORS[0]);

  function openCreate() {
    setEditing(null);
    setName("");
    setIcon("📁");
    setColor(COLORS[0]);
    setOpen(true);
  }

  function openEdit(c: Cat) {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon);
    setColor(c.color);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return;
    if (editing) {
      await editCategory(editing.id, { name, icon, color });
      setItems((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, name, icon, color } : c)),
      );
      toast.success("已保存");
    } else {
      const id = await addCategory({ name, icon, color });
      setItems((prev) => [...prev, { id, name, icon, color, count: 0 }]);
      toast.success("已创建");
      router.refresh();
    }
    setOpen(false);
  }

  async function onDragEnd(event: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = items.findIndex((c) => c.id === String(event.active.id));
    const newIndex = items.findIndex((c) => c.id === String(event.over!.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await reorderCategories(next.map((c) => c.id));
  }

  async function del(c: Cat) {
    await removeCategory(c.id);
    setItems((prev) => prev.filter((x) => x.id !== c.id));
    toast.success("已删除");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => void onDragEnd(e)}
      >
        <SortableContext
          items={items.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((c) => (
              <SortableCat
                key={c.id}
                cat={c}
                onEdit={openEdit}
                onDelete={() => void del(c)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑分类" : "新建分类"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cat-name">名称</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：开发工具"
              />
            </div>
            <div className="space-y-1">
              <Label>图标（emoji）</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      color === c
                        ? "scale-110 ring-2 ring-neutral-400"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <Button onClick={() => void save()} className="w-full rounded-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}