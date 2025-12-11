import { createAuthClient } from "better-auth/react";
// import { magicLinkClient } from "better-auth/client/plugins";
// import { tanstackStartCookies } from "better-auth/tanstack-start";
// import { betterAuth } from "better-auth";
console.log("🚀 ~ authClient ~ process.env.GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID)
console.log("🚀 ~ authClient ~ process.env.GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET)

// export const authClient = createAuthClient({
//     plugins: [magicLinkClient(), tanstackStartCookies()],
//     socialProviders: {
//         google: {
//             clientId: import.meta.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET as string,
//         },
//     },
// });

export const authClient = createAuthClient({})
