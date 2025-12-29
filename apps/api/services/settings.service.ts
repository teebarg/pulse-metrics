import { eq } from "drizzle-orm";
import { UpdateSettingsRequestSchema } from "../schemas/settings.schemas.js";
import { z } from "zod";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";

export const getSettings = async (userId: string) => {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

    if (!setting) {
        return null;
    }

    return setting;
};

export const updateSettings = async (userId: string, data: z.infer<typeof UpdateSettingsRequestSchema>) => {
    await db
        .insert(settings)
        .values({ userId, ...data })
        .onConflictDoUpdate({ target: settings.userId, set: data });

    return true;
};
