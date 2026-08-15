import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const { env } = getCloudflareContext();
  return createAuth(env, new URL(request.url).origin).handler(request);
}

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  return createAuth(env, new URL(request.url).origin).handler(request);
}