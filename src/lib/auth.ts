import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { roleForFirstUser } from "./role";

export function createAuth(
  env: CloudflareEnv | undefined,
  baseURL: string,
  cliMode = false
) {
  const cli = cliMode || !env;
  const db = env ? drizzle(env.DB, { schema }) : undefined;
  return betterAuth({
    ...withCloudflare(
      {
        d1: cli
          ? undefined
          : {
              db: db!,
              options: {
                schema,
                usePlural: false,
                debugLogs: false,
              },
            },
        kv: cli ? undefined : (env!.SESSION_KV as never),
        autoDetectIpAddress: false,
        geolocationTracking: false,
      },
      {
        secret: env?.BETTER_AUTH_SECRET ?? "cli-only-secret",
        baseURL,
        trustedOrigins: [
          baseURL,
          "http://localhost:3000",
          "http://127.0.0.1:3000",
        ],
        emailAndPassword: {
          enabled: true,
        },
        advanced: {
          cookiePrefix: "navos",
        },
        session: {
          expiresIn: 60 * 60 * 24 * 7,
          updateAge: 60 * 60 * 24,
        },
        user: {
          additionalFields: {
            role: {
              type: "string",
              defaultValue: "member",
              input: false,
            },
          },
        },
        databaseHooks: {
          user: {
            create: {
              before: async (userInput) => {
                const result = await db!
                  .select({ total: sql<number>`count(*)` })
                  .from(schema.user);
                return {
                  data: {
                    ...userInput,
                    role: roleForFirstUser(Number(result[0]?.total ?? 0)),
                  },
                };
              },
            },
          },
        },
      }
    ),
    ...(cli
      ? {
          database: drizzleAdapter({} as never, {
            provider: "sqlite",
            usePlural: false,
            debugLogs: true,
          }),
        }
      : {}),
  });
}