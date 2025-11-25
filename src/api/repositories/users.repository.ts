import { db } from "@/api/db/index.js";
import { users } from "@/api/db/schema.js";
import { eq, desc } from "drizzle-orm";

export class UserRepository {
    async insert(data: any) {
        const [org] = await db
            .insert(users)
            .values({ ...data })
            .returning();

        if (!org) {
            throw new Error("Failed to create organization");
        }
        return org;
    }

    async updateById(id: string, data: any) {
        const updatedUser = await db
            .update(users)
            .set({ ...data })
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser) {
            throw new Error("Failed to update user");
        }
        return updatedUser;
    }

    async userOrg(id: string) {
        const userData = await db.select({ organization_id: users.organizationId }).from(users).where(eq(users.id, id)).limit(1);
        console.log("🚀 ~ file: users.repository.ts:33 ~ userData:", userData);
        return userData;
    }
}
