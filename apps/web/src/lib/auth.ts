import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { magicLink, oneTap } from "better-auth/plugins";
import { Pool } from "pg";
import { api } from "~/utils/fetch-api";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL!,
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        tanstackStartCookies(),
        magicLink({
            sendMagicLink: async ({ email, url }, ctx) => {
                await api.post<any>("/magic-link", {
                    magicLink: url,
                    email,
                });
            },
        }),
        oneTap(),
    ],
    socialProviders: {
        google: {
            clientId: process.env.VITE_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    trustedOrigins: ["http://pm.localhost:7060", "http://localhost:5174"],
});
