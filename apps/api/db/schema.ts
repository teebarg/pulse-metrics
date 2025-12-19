import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp, varchar, integer, uuid, pgEnum, boolean, unique, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const organizationPlanEnum = pgEnum("organization_plan", ["free", "pro", "enterprise"]);

export const organizationRoleEnum = pgEnum("organization_role", ["owner", "admin", "member"]);

export const organizations = pgTable("organization", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    domain: text("domain"),
    plan: organizationPlanEnum("plan").default("free"),
    apiKey: text("apiKey").notNull().unique(),
    eventsLimit: integer("eventsLimit").default(100),
    eventsUsed: integer("eventsUsed").default(0),
    eventsReceived: integer("eventsReceived").default(0),
    platform: text("platform").default("custom"),
    onboardingCompleted: boolean("onboardingCompleted").default(false),
    onboardingStep: integer("onboardingStep").default(0),
    onboardingSkipped: integer("onboardingSkipped").default(0),
    onboardingCompletedAt: timestamp("onboardingCompletedAt").defaultNow(),
    createdAt: timestamp("createdAt", {
        withTimezone: true,
    }).defaultNow(),

    updatedAt: timestamp("updatedAt", {
        withTimezone: true,
    }).defaultNow(),
});

export const users = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    twoFactorEnabled: boolean("twoFactorEnabled").notNull().default(false),
    role: organizationRoleEnum("role").default("owner"),
    organizationId: uuid("organizationId").references(() => organizations.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
});

export const twoFactor = pgTable("two_factor", {
    id: text("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    secret: text("secret").notNull(),
    backupCodes: text("backupCodes").notNull(),
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
        organizationId: uuid("organizationId")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        eventType: text("eventType").notNull(),
        sessionId: text("sessionId"),
        metadata: jsonb("metadata"),
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

        organizationId: uuid("organizationId")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),

        metricType: text("metricType").notNull(),

        timeWindow: text("timeWindow").notNull(), // '1h', '1d', '7d'

        periodStart: timestamp("periodStart", {
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
