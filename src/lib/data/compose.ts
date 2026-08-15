import { getDb } from "@/lib/db";
import { listCategoriesWithCount } from "./categories";
import { listWebsites } from "./websites";
import { favoriteIds } from "./favorites";

export async function siteData(userId: string | null) {
  const db = getDb();
  const [categories, websites, favSet] = await Promise.all([
    listCategoriesWithCount(db, userId),
    listWebsites(db, userId),
    favoriteIds(db, userId),
  ]);
  const favs = new Set(favSet);
  return {
    categories,
    websites: websites.map((w) => ({ ...w, favorited: favs.has(w.id) })),
  };
}