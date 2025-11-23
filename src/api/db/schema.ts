import { index, pgTable, serial, text, timestamp, varchar, integer, uuid, pgEnum, boolean, unique, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

// Enum for document status
export const documentStatusEnum = pgEnum("document_status", ["processing", "completed", "failed"]);

// Enum for organization plan
export const organizationPlanEnum = pgEnum("organization_plan", ["free", "pro", "enterprise"]);

export const organizationRoleEnum = pgEnum("organization_role", ["owner", "admin", "member"]);

// Documents table - stores metadata about uploaded documents
export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    domain: text("domain"),
    plan: organizationPlanEnum("plan").default("free").notNull(),
    apiKey: text("api_key").notNull().unique(),
    eventsLimit: integer("events_limit").default(100).notNull(),
    eventsUsed: integer("events_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").default("owner").notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    onboardingStep: integer("onboarding_step").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    sessionId: text("session_id"),
    properties: jsonb("properties"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => ({
    idxOrgTimestamp: index("idx_org_timestamp").on(
      table.organizationId,
      table.timestamp.desc()
    ),

    idxEventType: index("idx_event_type").on(
      table.organizationId,
      table.eventType,
      table.timestamp.desc()
    ),
  })
)


export const analyticsCache = pgTable(
  "analytics_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    metricType: text("metric_type").notNull(),

    timeWindow: text("time_window").notNull(), // '1h', '1d', '7d'

    periodStart: timestamp("period_start", {
      withTimezone: true,
    }).notNull(),

    value: jsonb("value").notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => ({
    uniqCache: uniqueIndex("analytics_cache_unique").on(
      table.organizationId,
      table.metricType,
      table.timeWindow,
      table.periodStart
    ),
  })
);
