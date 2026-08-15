import { sqliteTable, text, integer, index, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("folder"),
    color: text("color").notNull().default("#007aff"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("categories_user_idx").on(t.userId)]
);

export const websites = sqliteTable(
  "websites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    iconUrl: text("icon_url").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("websites_user_idx").on(t.userId),
    index("websites_category_idx").on(t.categoryId),
  ]
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("tags_user_idx").on(t.userId)]
);

export const websiteTags = sqliteTable(
  "website_tags",
  {
    websiteId: text("website_id").notNull(),
    tagId: text("tag_id").notNull(),
  },
  (t) => [
    index("website_tags_website_idx").on(t.websiteId),
    index("website_tags_tag_idx").on(t.tagId),
  ]
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    websiteId: text("website_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [unique("favorites_user_website").on(t.userId, t.websiteId)]
);

export const visitLogs = sqliteTable(
  "visit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    websiteId: text("website_id").notNull(),
    visitedAt: integer("visited_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("visit_logs_user_idx").on(t.userId, t.visitedAt)]
);

export const searchLogs = sqliteTable(
  "search_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    query: text("query").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("search_logs_user_idx").on(t.userId)]
);

export const adminLogs = sqliteTable("admin_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const aiTasks = sqliteTable("ai_tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  payload: text("payload"),
  result: text("result"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
