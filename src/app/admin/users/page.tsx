import { getDb } from "@/lib/db";
import { listUsers } from "@/lib/data/stats";
import { requireAdmin } from "@/lib/session";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsers(getDb());
  return <UsersClient users={users} />;
}