import { and, eq } from "drizzle-orm";
import { favorites } from "@/db/schema";
import type { Db } from "@/lib/db";

export async function isFavorite(db: Db, userId: string, websiteId: string) {
  const rows = await db
    .select({ id: favorites.websiteId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.websiteId, websiteId)))
    .limit(1);
  return rows.length > 0;
}

export async function toggleFavorite(
  db: Db,
  userId: string,
  websiteId: string,
) {
  const existing = await isFavorite(db, userId, websiteId);
  if (existing) {
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.websiteId, websiteId)),
      );
    return false;
  }
  await db.insert(favorites).values({ userId, websiteId });
  return true;
}

export async function favoriteIds(
  db: Db,
  userId: string | null,
): Promise<string[]> {
  if (!userId) return [];
  const rows = await db
    .select({ websiteId: favorites.websiteId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return rows.map((r) => r.websiteId);
}