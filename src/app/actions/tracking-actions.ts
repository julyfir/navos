"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { toggleFavorite } from "@/lib/data/favorites";
import { createWebsite, updateWebsite } from "@/lib/data/websites";
import { getSessionUser } from "@/lib/session";
import { visitLogs, searchLogs, websites } from "@/db/schema";

export async function recordVisit(websiteId: string) {
  const user = await getSessionUser();
  if (!user) return;
  const db = getDb();
  await db.insert(visitLogs).values({ id: crypto.randomUUID(), userId: user.id, websiteId });
}

export async function recordSearch(query: string) {
  const user = await getSessionUser();
  if (!user || !query.trim()) return;
  await getDb().insert(searchLogs).values({
    id: crypto.randomUUID(),
    userId: user.id,
    query: query.trim().slice(0, 100),
  });
}

export async function toggleFav(websiteId: string) {
  const user = await getSessionUser();
  if (!user) return false;
  return toggleFavorite(getDb(), user.id, websiteId);
}