import { db } from "@/api/db/index.js";
import { organizations } from "@/api/db/schema.js";
import { eq, desc } from "drizzle-orm";

export class OrganizationRepository {
    async create(data: {
        id: string;
        userId: string;
        title: string;
        status: "processing" | "completed" | "failed";
        chunks: number;
        fileName: string | null;
        fileType: string | null;
        fileSize: number | null;
    }) {
        const now = new Date();
        await db.insert(organizations).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        });
    }

    async updateStatus(id: string, status: "processing" | "completed" | "failed") {
        await db.update(organizations).set({ status, updatedAt: new Date() }).where(eq(organizations.id, id));
    }
}
