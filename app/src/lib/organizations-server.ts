import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "./supabase/supabase";
import { db } from "@/api/db";
import { users } from "@/api/db/schema";
import { eq } from "drizzle-orm";

export const getOrganizationFn = createServerFn({ method: "GET" }).handler(async () => {
    const supabase = getSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Not authenticated");
    }

    const userWithOrg = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: {
            organization: true,
        },
    });
    return userWithOrg;
});
