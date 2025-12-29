import { organizations } from "../db/schema.js";
import type { OrganizationRepository } from "../repositories/organization.repository.js";
import type { UserRepository } from "../repositories/users.repository.js";
import { generateApiKey } from "../utils/common.utils.js";

export class OrganizationService {
    constructor(
        private organizationRepo: OrganizationRepository,
        private usersRepo: UserRepository,
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
