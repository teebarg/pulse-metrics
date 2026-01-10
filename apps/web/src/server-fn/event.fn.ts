import { createServerFn } from "@tanstack/react-start";
import { api } from "~/utils/fetch-api";

export const getOrgEventsFn = createServerFn().handler(async () => {
    return await api.get<any>("/v1/events", { shouldRedirect: true });
});
