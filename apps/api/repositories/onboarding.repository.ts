import { db } from "../db/index.js";
import { analyticsCache, events } from "../db/schema.js";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export class OnBoardingRepository {
    async update(id: string, data: { title: string }) {
        const now = new Date();
        await db
            .update(analyticsCache)
            .set({ ...data, updatedAt: now })
            .where(eq(analyticsCache.id, id));

        const conversation = await db.select().from(analyticsCache).where(eq(analyticsCache.id, id));

        return {
            id: conversation[0].id,
        };
    }
}
