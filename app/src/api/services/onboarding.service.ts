import { OnBoardingRepository } from "@/api/repositories/onboarding.repository";
import { OrganizationRepository } from "@/api/repositories/organizations.repository";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";
import { gt, eq, sql, and } from "drizzle-orm";
import { db, pool } from "../db";
import { events } from "../db/schema";

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

    async CompleteOnboarding(user: any, data: any) {
        const userData = await this.usersRepo.userOrg(user.id);

        if (!userData[0]?.organizationId) {
            return {
                success: false,
                message: "Organization not found",
            };
        }

        const organization = await this.organizationRepo.updateById(userData[0].organizationId, {
            onboarding_completed: true,
            name: data.store,
            domain: data.domain,
            metadata: { platform: data.platform },
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
        });

        await this.eventsRepo.insert({
            organizationId: userData[0].organizationId,
            event_type: "onboarding_completed",
            properties: { platform: data.platform, has_url: !!data.domain },
        });

        return {
            success: true,
        };
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
