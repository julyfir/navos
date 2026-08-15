"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  addWebsitesFromImport,
  createSingleSite,
  editWebsite,
  removeWebsite,
} from "@/app/actions/website-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  title: string;
  url: string;
  description: string | null;
  categoryId: string | null;
}

interface CategoryRow {
  id: string;
  name: string;
}

export function WebsitesClient({
  websites,
  categories,
}: {
  websites: Row[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    categoryId: "",
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: "", url: "", description: "", categoryId: "" });
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm({
      title: row.title,
      url: row.url,
      description: row.description ?? "",
      categoryId: row.categoryId ?? "",
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.title.trim() || !form.url.trim()) return;
    if (editing) {
      await editWebsite(editing.id, {
        title: form.title,
        url: form.url,
        description: form.description,
        categoryId: form.categoryId || null,
      });
      toast.success("已保存");
    } else {
      await createSingleSite({
        title: form.title,
        url: form.url,
        description: form.description,
        categoryId: form.categoryId || null,
      });
      toast.success("已创建");
    }
    setFormOpen(false);
    router.refresh();
  }

  async function handleImport() {
    await addWebsitesFromImport(importText);
    setImportOpen(false);
    setImportText("");
    toast.success("导入完成");
    router.refresh();
  }

  async function del(row: Row) {
    await removeWebsite(row.id);
    toast.success("已删除");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">网站管理</h1>
        <div className="flex gap-2">
          <Button onClick={openCreate} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            添加网站
          </Button>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量导入网址</DialogTitle>
              </DialogHeader>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={"每行一个网址，例如：\ngithub.com\nhttps://vercel.com"}
                rows={8}
              />
              <Button onClick={() => void handleImport()} className="w-full rounded-full">
                导入
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>分类</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.title}</TableCell>
                <TableCell className="max-w-[260px] truncate text-neutral-500">
                  {w.url}
                </TableCell>
                <TableCell>
                  {categories.find((c) => c.id === w.categoryId)?.name ?? "未分类"}
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(w)}
                    aria-label="编辑"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void del(w)}
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑网站" : "添加网站"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>标题</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>简介</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label>分类</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="未分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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