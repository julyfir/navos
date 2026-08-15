import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";

export async function getSessionUser() {
  const { env } = getCloudflareContext();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const auth = createAuth(env, `${proto}://${host}`);
  const session = await auth.api.getSession({ headers: h });
  return session?.user ?? null;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("无权限：需要管理员账号");
  }
  return user;
}