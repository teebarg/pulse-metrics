import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { magicLink } from "better-auth/plugins";
import { Pool } from "pg";

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
            sendMagicLink: async ({ email, token, url }, ctx) => {
                console.log("🚀 ~ file: auth.ts:17 ~ ctx:", ctx);
                console.log("🚀 ~ file: auth.ts:17 ~ url:", url);
                console.log("🚀 ~ file: auth.ts:17 ~ token:", token);
                console.log("🚀 ~ file: auth.ts:17 ~ email:", email);
                // send email to user
            },
        }),
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    trustedOrigins: ["http://pm.localhost:7060"],
});
