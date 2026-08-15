import { and, asc, eq, sql } from "drizzle-orm";
import { categories, websites } from "@/db/schema";
import type { Db } from "@/lib/db";

export interface CategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export async function listCategoriesWithCount(
  db: Db,
  userId: string | null,
) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      sortOrder: categories.sortOrder,
      count: sql<number>`count(${websites.id})`,
    })
    .from(categories)
    .leftJoin(websites, eq(websites.categoryId, categories.id))
    .where(userId ? eq(categories.userId, userId) : undefined)
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function createCategory(
  db: Db,
  userId: string,
  input: CategoryInput,
) {
  const id = crypto.randomUUID();
  await db.insert(categories).values({ id, userId, sortOrder: 0, ...input });
  return id;
}

export async function updateCategory(
  db: Db,
  userId: string,
  id: string,
  input: Partial<CategoryInput>,
) {
  await db
    .update(categories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(db: Db, userId: string, id: string) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function updateCategoryOrder(
  db: Db,
  userId: string,
  orderedIds: string[],
) {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(categories)
        .set({ sortOrder: index })
        .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    }
  });
}