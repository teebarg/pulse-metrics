import { betterAuth } from "better-auth";
import { magicLinkClient } from "better-auth/client/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL!,
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [magicLinkClient(), tanstackStartCookies()],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});
