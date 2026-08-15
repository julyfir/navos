"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  createWebsite,
  deleteWebsite,
  updateWebsite,
  updateWebsiteOrder,
} from "@/lib/data/websites";
import { requireAdmin, getSessionUser } from "@/lib/session";
import { parseImportText } from "@/lib/parse-import";

export async function addWebsitesFromImport(raw: string) {
  const user = await requireAdmin();
  const db = getDb();
  for (const site of parseImportText(raw)) {
    await createWebsite(db, user.id, {
      title: site.title,
      url: site.url,
      iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`,
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/websites");
}

export async function createSingleSite(input: {
  title: string;
  url: string;
  description?: string;
  categoryId?: string | null;
}) {
  const user = await requireAdmin();
  await createWebsite(getDb(), user.id, {
    title: input.title,
    url: input.url,
    description: input.description ?? "",
    categoryId: input.categoryId,
    iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(input.url).hostname}&sz=64`,
  });
  revalidatePath("/");
  revalidatePath("/admin/websites");
}

export async function editWebsite(
  id: string,
  input: {
    title: string;
    url: string;
    description?: string;
    categoryId?: string | null;
  },
) {
  const user = await requireAdmin();
  await updateWebsite(getDb(), user.id, id, input);
  revalidatePath("/");
  revalidatePath("/admin/websites");
}

export async function removeWebsite(id: string) {
  const user = await requireAdmin();
  await deleteWebsite(getDb(), user.id, id);
  revalidatePath("/");
  revalidatePath("/admin/websites");
}

export async function reorderWebsites(orderedIds: string[]) {
  const user = await requireAdmin();
  await updateWebsiteOrder(getDb(), user.id, orderedIds);
  revalidatePath("/");
}