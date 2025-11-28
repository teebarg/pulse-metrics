import { db } from "@/api/db/index.js";
import { organizations } from "@/api/db/schema.js";
import { eq, desc } from "drizzle-orm";

export class OrganizationRepository {
    async insert(data: any) {
        const [org] = await db
            .insert(organizations)
            .values({ ...data })
            .returning();

        if (!org) {
            throw new Error("Failed to create organization");
        }
        return org;
    }

    async updateById(id: string, data: any) {
        const updatedUser = await db
            .update(organizations)
            .set({ ...data })
            .where(eq(organizations.id, id))
            .returning();

        if (!updatedUser) {
            throw new Error("Failed to update organization");
        }
        return updatedUser;
    }
}
