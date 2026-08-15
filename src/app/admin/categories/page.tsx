import { getDb } from "@/lib/db";
import { listCategoriesWithCount } from "@/lib/data/categories";
import { requireAdmin } from "@/lib/session";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  const cats = await listCategoriesWithCount(getDb(), admin.id);
  return <CategoriesClient cats={cats} />;
}