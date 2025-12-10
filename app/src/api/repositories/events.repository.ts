import { db } from "@/api/db/index.js";
import { events } from "@/api/db/schema.js";
import { eq, desc, and } from "drizzle-orm";

export class EventsRepository {
    async create(data: any) {
        const [org] = await db
            .insert(events)
            .values({ ...data })
            .returning();

        if (!org) {
            throw new Error("Failed to create event");
        }
        return org;
    }

    async update(id: string, data: { title: string }) {
        const now = new Date();
        await db
            .update(events)
            .set({ ...data, updatedAt: now })
            .where(eq(events.id, id));

        const event = await db.select().from(events).where(eq(events.id, id));

        return {
            id: event[0].id,
            updated_at: now.toISOString(),
        };
    }

    async delete(id: string) {
        await db.delete(events).where(eq(events.id, id));
    }
}
