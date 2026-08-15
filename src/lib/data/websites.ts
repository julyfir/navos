import { and, asc, desc, eq } from "drizzle-orm";
import { favorites, visitLogs, websites } from "@/db/schema";
import type { Db } from "@/lib/db";

export interface WebsiteInput {
  categoryId?: string | null;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export async function listWebsites(
  db: Db,
  userId: string | null,
  categoryId?: string | null,
) {
  const where = userId
    ? categoryId
      ? and(eq(websites.userId, userId), eq(websites.categoryId, categoryId))
      : eq(websites.userId, userId)
    : categoryId
      ? eq(websites.categoryId, categoryId)
      : undefined;
  return db
    .select({
      id: websites.id,
      title: websites.title,
      url: websites.url,
      description: websites.description,
      iconUrl: websites.iconUrl,
      sortOrder: websites.sortOrder,
      categoryId: websites.categoryId,
    })
    .from(websites)
    .where(where)
    .orderBy(asc(websites.sortOrder), asc(websites.title));
}

export async function createWebsite(
  db: Db,
  userId: string,
  input: WebsiteInput,
) {
  const id = crypto.randomUUID();
  await db.insert(websites).values({ id, userId, ...input });
  return id;
}

export async function updateWebsite(
  db: Db,
  userId: string,
  id: string,
  input: Partial<WebsiteInput>,
) {
  await db
    .update(websites)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(websites.id, id), eq(websites.userId, userId)));
}

export async function deleteWebsite(db: Db, userId: string, id: string) {
  await db
    .delete(websites)
    .where(and(eq(websites.id, id), eq(websites.userId, userId)));
}

export async function updateWebsiteOrder(
  db: Db,
  userId: string,
  orderedIds: string[],
) {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(websites)
        .set({ sortOrder: index })
        .where(and(eq(websites.id, id), eq(websites.userId, userId)));
    }
  });
}

export async function listRecentWebsites(db: Db, userId: string, limit = 8) {
  return db
    .select({
      id: websites.id,
      title: websites.title,
      url: websites.url,
      iconUrl: websites.iconUrl,
      visitedAt: visitLogs.visitedAt,
    })
    .from(visitLogs)
    .innerJoin(websites, eq(visitLogs.websiteId, websites.id))
    .where(eq(visitLogs.userId, userId))
    .orderBy(desc(visitLogs.visitedAt))
    .limit(limit);
}

export async function listFavoriteWebsites(db: Db, userId: string) {
  return db
    .select({
      id: websites.id,
      title: websites.title,
      url: websites.url,
      iconUrl: websites.iconUrl,
    })
    .from(favorites)
    .innerJoin(websites, eq(favorites.websiteId, websites.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}