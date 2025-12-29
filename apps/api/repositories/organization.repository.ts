import { db } from "../db/index.js";
import { organizations } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

export class OrganizationRepository {
    async getOrg(id: string) {
        const org = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
        return org;
    }
    async create(data: any, returnKeys: Record<any, any>) {
        const [org] = await db
            .insert(organizations)
            .values({ ...data })
            .returning({ ...returnKeys });

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
