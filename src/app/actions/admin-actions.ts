"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { logAdmin, setUserRole } from "@/lib/data/stats";
import { requireAdmin } from "@/lib/session";

const ROLES = new Set(["admin", "member"]);

export async function changeRole(targetId: string, role: string) {
  const admin = await requireAdmin();
  if (!ROLES.has(role)) throw new Error("非法角色");
  await setUserRole(getDb(), targetId, role);
  await logAdmin(getDb(), admin.id, "user.role", `${targetId} -> ${role}`);
  revalidatePath("/admin/users");
}