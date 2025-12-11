import { createServerFn } from "@tanstack/react-start";
import { db } from "@/api/db";
import { users } from "@/api/db/schema";
import { eq } from "drizzle-orm";
// import { authClient } from "~/lib/auth-client";
// import { auth } from "~/lib/auth";

export const getOrganizationFn = createServerFn({ method: "GET" })
    .inputValidator((input: string) => input)
    .handler(async ({ data }) => {
        // const { data: session, error } = await authClient.getSession();
        // const data = await auth.api.getSession()
        // console.log("🚀 ~ data:", data)

        // if (!data?.session) {
        //     throw new Error("Not authenticated");
        // }
        const userWithOrg = await db.query.users.findFirst({
            where: eq(users.id, data),
            with: {
                organization: true,
            },
        });
        return userWithOrg;
    });
