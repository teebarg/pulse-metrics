import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp, varchar, integer, uuid, pgEnum, boolean, unique, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const organizationPlanEnum = pgEnum("organization_plan", ["free", "pro", "enterprise"]);

export const organizationRoleEnum = pgEnum("organization_role", ["owner", "admin", "member"]);

export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    domain: text("domain"),
    plan: organizationPlanEnum("plan").default("free"),
    apiKey: text("api_key").notNull().unique(),
    eventsLimit: integer("events_limit").default(100),
    eventsUsed: integer("events_used").default(0),
    eventsReceived: integer("events_received").default(0),
    platform: text("platform").default("custom"),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    onboardingStep: integer("onboarding_step").default(0),
    onboardingSkipped: integer("onboarding_skipped").default(0),
    onboardingCompletedAt: timestamp("onboarding_completed_at").defaultNow(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").notNull().unique(),
    role: organizationRoleEnum("role").default("owner"),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ one }) => ({
    owner: one(users, {
        fields: [organizations.id],
        references: [users.organizationId],
    }),
}));

export const usersRelations = relations(users, ({ one }) => ({
    organization: one(organizations, {
        fields: [users.organizationId],
        references: [organizations.id],
    }),
}));

export const events = pgTable(
    "events",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        eventType: text("event_type").notNull(),
        sessionId: text("session_id"),
        properties: jsonb("properties"),
        timestamp: timestamp("timestamp", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).defaultNow(),
    },
    (table) => ({
        idxOrgTimestamp: index("idx_org_timestamp").on(table.organizationId, table.timestamp.desc()),

        idxEventType: index("idx_event_type").on(table.organizationId, table.eventType, table.timestamp.desc()),
    })
);

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

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).defaultNow(),
    },
    (table) => ({
        uniqCache: uniqueIndex("analytics_cache_unique").on(table.organizationId, table.metricType, table.timeWindow, table.periodStart),
    })
);
