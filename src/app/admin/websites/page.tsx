import { getDb } from "@/lib/db";
import { listWebsites } from "@/lib/data/websites";
import { listCategoriesWithCount } from "@/lib/data/categories";
import { requireAdmin } from "@/lib/session";
import { WebsitesClient } from "./websites-client";

export const dynamic = "force-dynamic";

export default async function AdminWebsitesPage() {
  const admin = await requireAdmin();
  const db = getDb();
  const [websites, categories] = await Promise.all([
    listWebsites(db, admin.id),
    listCategoriesWithCount(db, admin.id),
  ]);
  return <WebsitesClient websites={websites} categories={categories} />;
}