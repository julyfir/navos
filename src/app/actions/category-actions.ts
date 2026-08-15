"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  updateCategoryOrder,
} from "@/lib/data/categories";
import { requireAdmin } from "@/lib/session";

export async function addCategory(input: {
  name: string;
  icon: string;
  color: string;
}) {
  const user = await requireAdmin();
  const id = await createCategory(getDb(), user.id, input);
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return id;
}

export async function editCategory(
  id: string,
  input: { name: string; icon: string; color: string },
) {
  const user = await requireAdmin();
  await updateCategory(getDb(), user.id, id, input);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function removeCategory(id: string) {
  const user = await requireAdmin();
  await deleteCategory(getDb(), user.id, id);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function reorderCategories(orderedIds: string[]) {
  const user = await requireAdmin();
  await updateCategoryOrder(getDb(), user.id, orderedIds);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}