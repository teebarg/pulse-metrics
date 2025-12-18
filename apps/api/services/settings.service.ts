import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { SettingsSchema, UpdateSettingsRequestSchema } from "~/schemas/settings.schemas";
import { z } from "zod";

export const getSettings = async (userId: string) => {
    const [user] = await db
        .select({
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
    };
};

export const updateSettings = async (userId: string, data: z.infer<typeof UpdateSettingsRequestSchema>) => {
    const updateData: any = {};

    if (data.apiKey !== undefined) {
        updateData.apiKey = data.apiKey;
    }

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning({
        id: users.id,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
    });

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return {
        createdAt: updatedUser.createdAt?.toISOString(),
        updatedAt: updatedUser.updatedAt?.toISOString(),
    };
};
