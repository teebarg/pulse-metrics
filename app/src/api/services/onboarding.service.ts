import { OnBoardingRepository } from "@/api/repositories/onboarding.repository";
import { OrganizationRepository } from "@/api/repositories/organizations.repository";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";
import { gt, eq, sql, and } from "drizzle-orm";
import { db, pool } from "@/api/db";
import { organizations, events } from "@/api/db/schema";
import { generateApiKey } from "~/api/utils/common.utils";

export class OnBoardingService {
    constructor(
        private onboardingRepo: OnBoardingRepository,
        private organizationRepo: OrganizationRepository,
        private usersRepo: UserRepository,
        private eventsRepo: EventsRepository
    ) {}

    async StartOnboarding(user: any) {
        const organization = await this.organizationRepo.insert({
            name: `${user.email}'s Store`,
            plan: "free",
            onboarding_completed: false,
        });

        await this.usersRepo.updateById(user.id, {
            organizationId: organization.id,
            role: "owner",
        });

        return {
            success: true,
            organizationId: organization.id,
            api_key: organization.apiKey,
        };
    }

    async UpdateOnboarding(user: any, data: any) {
        const userData = await this.usersRepo.userOrg(user.id);
        if (!userData[0].organizationId) {
            const org = await this.organizationRepo.create(
                {
                    domain: user.email?.split("@")[1],
                    apiKey: generateApiKey(),
                    onboardingStep: data.step,
                },
                { id: organizations.id }
            );
            // const org = await db
            //     .insert(organizations)
            //     .values({
            //         domain: user.email?.split("@")[1],
            //         apiKey: generateApiKey(),
            //         onboardingStep: data.step,
            //     })
            //     .returning({ id: organizations.id });
            await this.usersRepo.updateById(user.id, {
                organizationId: org.id,
            });
            // await db
            //     .update(users)
            //     .set({
            //         organizationId: org[0].id,
            //     })
            //     .where(eq(users.id, user.id));
            return { success: true, step: data.step };
        }

        await this.organizationRepo.updateById(userData[0].organizationId, {
            ...data,
            onboardingStep: data.step,
            updatedAt: new Date(),
        });
        // await db
        //     .update(organizations)
        //     .set({
        //         ...data,
        //         onboardingStep: data.step,
        //         updatedAt: new Date(),
        //     })
        //     .where(eq(organizations.id, dbUser[0].organizationId));

        return { success: true, step: data.step };
    }

    async CompleteOnboarding(user: any, data: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            const org = await this.organizationRepo.create(
                {
                    name: `${user.email}'s Store`,
                    plan: "free",
                    onboarding_completed: false,
                },
                { id: organizations.id }
            );
            await this.usersRepo.updateById(user.id, {
                organizationId: org.id,
            });
            return { success: true, step: data.step };
        }

        await this.organizationRepo.updateById(userData[0].organizationId, {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
            onboardingStep: data.step,
            updatedAt: new Date(),
        });

        return { success: true, completed: data.completed };
    }

    async VerifyEvents(user: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            return {
                success: false,
                message: "Organization not found",
            };
        }
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(events)
            .where(and(eq(events.organizationId, userData[0]?.organizationId), gt(events.timestamp, fiveMinutesAgo)));

        const count = result?.[0]?.count ?? 0;

        return {
            events_received: count,
            is_tracking: count > 0,
        };
    }

    async OnboardingStatus(user: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            return {
                onboarding_completed: false,
                onboardingStep: 0,
            };
        }
        const query = `
            SELECT onboarding_completed, name, api_key, metadata
            FROM organizations
            WHERE id = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [userData[0].organizationId]);
        const org = result.rows[0] ?? {};

        return {
            onboarding_completed: org.onboarding_completed ?? false,
            store_name: org.name,
            platform: org.metadata?.platform,
            api_key: org.api_key,
        };
    }

    async SkipOnboarding(user: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            return {
                success: false,
            };
        }
        await this.organizationRepo.updateById(userData[0].organizationId, {
            onboardingCompleted: true,
            onboardingSkipped: true,
            onboardingCompletedAt: new Date(),
        });

        return {
            success: true,
        };
    }
}
