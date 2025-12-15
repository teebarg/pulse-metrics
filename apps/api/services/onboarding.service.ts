import { OnBoardingRepository } from "~/repositories/onboarding.repository";
import { OrganizationRepository } from "~/repositories/organization.repository";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";
import { gt, eq, sql, and } from "drizzle-orm";
import { db, pool } from "~/db";
import { organizations, events } from "~/db/schema";
import { generateApiKey } from "~/utils/common.utils";

export class OnBoardingService {
    constructor(
        private onboardingRepo: OnBoardingRepository,
        private organizationRepo: OrganizationRepository,
        private usersRepo: UserRepository,
        private eventsRepo: EventsRepository
    ) {}

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
            await this.usersRepo.updateById(user.id, {
                organizationId: org.id,
            });
            return { success: true, step: data.step };
        }

        await this.organizationRepo.updateById(userData[0].organizationId, {
            ...data,
            onboardingStep: data.step,
            updatedAt: new Date(),
        });
        return { success: true, step: data.step };
    }

    async CompleteOnboarding(user: any, data: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            const org = await this.organizationRepo.create(
                {
                    name: `${user.email}'s Store`,
                    plan: "free",
                    onboardingCompleted: false,
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
            const org = await this.organizationRepo.create(
                {
                    domain: user.email?.split("@")[1],
                    apiKey: generateApiKey(),
                    onboardingStep: 0,
                },
                { id: organizations.id }
            );
            await this.usersRepo.updateById(user.id, {
                organizationId: org.id,
            });
            return {
                onboardingCompleted: false,
                onboardingStep: 0,
            };
        }
        // const query = `
        //     SELECT onboardingCompleted, onboardingStep
        //     FROM organization
        //     WHERE id = $1
        //     LIMIT 1
        // `;
        // const result = await pool.query(query, [userData[0].organizationId]);
        // const org = result.rows[0] ?? {};
        const res = await this.organizationRepo.getOrg(userData[0].organizationId);
        const org = res[0]

        return {
            onboardingCompleted: org.onboardingCompleted ?? false,
            onboardingStep: org.onboardingStep ?? 0,
        };
    }
}
