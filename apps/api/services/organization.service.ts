import { OnBoardingRepository } from "~/repositories/onboarding.repository";
import { OrganizationRepository } from "~/repositories/organization.repository";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";
import { gt, eq, sql, and } from "drizzle-orm";
import { db, pool } from "~/db";
import { organizations } from "~/db/schema";
import { generateApiKey } from "~/utils/common.utils";

export class OrganizationService {
    constructor(
        private onboardingRepo: OnBoardingRepository,
        private organizationRepo: OrganizationRepository,
        private usersRepo: UserRepository,
        private eventsRepo: EventsRepository
    ) {}

    async GenerateOrganization(user: any) {
        const userData = await this.usersRepo.userOrg(user.id);
        if (!userData[0]?.organizationId) {
            const org = await this.organizationRepo.create(
                {
                    domain: user.email?.split("@")[1],
                    apiKey: generateApiKey(),
                    onboardingStep: 0,
                },
                { ...organizations }
            );
            await this.usersRepo.updateById(user.id, {
                organizationId: org.id,
            });
            return org;
        }

        const org = await this.organizationRepo.getOrg(userData[0].organizationId);
        return org[0];
    }

    async UpdateOrganization(user: any, data: any) {
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
            return { success: true, message: "Organization updated successfully" };
        }

        await this.organizationRepo.updateById(userData[0].organizationId, {
            ...data,
            onboardingStep: data.step,
            updatedAt: new Date(),
        });
        return { success: true, message: "Organization updated successfully" };
    }
}
