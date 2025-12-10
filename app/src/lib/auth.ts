import { betterAuth } from "better-auth";
// import { Pool } from "pg";
import { db } from "~/api/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/api/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        usePlural: true,
        schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
});
