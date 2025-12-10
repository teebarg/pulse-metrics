import { createServerFn } from "@tanstack/react-start";
import { db } from "@/api/db";
import { users } from "@/api/db/schema";
import { eq } from "drizzle-orm";
import { authClient } from "~/lib/auth-client";

export const getOrganizationFn = createServerFn({ method: "GET" }).handler(async () => {
    const { data: session, error } = await authClient.getSession();
    if (error || !session) {
        throw new Error("Not authenticated");
    }
    const userWithOrg = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        with: {
            organization: true,
        },
    });
    return userWithOrg;
});
