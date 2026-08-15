import { and, count, eq, sql } from "drizzle-orm";
import { adminLogs, categories, user, visitLogs, websites } from "@/db/schema";
import type { Db } from "@/lib/db";

export async function dashboardStats(db: Db, userId: string) {
  const [siteN, catN, visitN] = await Promise.all([
    db
      .select({ n: count(websites.id) })
      .from(websites)
      .where(eq(websites.userId, userId)),
    db
      .select({ n: count(categories.id) })
      .from(categories)
      .where(eq(categories.userId, userId)),
    db
      .select({ n: count(visitLogs.id) })
      .from(visitLogs)
      .where(
        and(
          eq(visitLogs.userId, userId),
          sql`date(${visitLogs.visitedAt}, 'unixepoch') = date('now')`,
        ),
      ),
  ]);
  return {
    websites: Number(siteN[0]?.n ?? 0),
    categories: Number(catN[0]?.n ?? 0),
    todayVisits: Number(visitN[0]?.n ?? 0),
  };
}

export async function listUsers(db: Db) {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);
}

export async function setUserRole(db: Db, targetId: string, role: string) {
  await db.update(user).set({ role }).where(eq(user.id, targetId));
}

export async function logAdmin(db: Db, userId: string, action: string, detail?: string) {
  await db.insert(adminLogs).values({
    id: crypto.randomUUID(),
    userId,
    action,
    detail,
  });
}