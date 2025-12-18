import { EventsRepository } from "~/repositories/events.repository";

export class EventsService {
    constructor(private eventsRepo: EventsRepository) {}

    async updateSettings(
        userId: string,
        data: {
            name?: string;
            apiKey?: string;
        }
    ) {
        return this.eventsRepo.create(data);
    }

    async deleteApiKey(userId: string) {
        return this.eventsRepo.delete(userId);
    }
}
