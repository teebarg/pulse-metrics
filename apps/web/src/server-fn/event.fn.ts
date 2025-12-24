import { createServerFn } from "@tanstack/react-start";
import { api } from "~/utils/fetch-api";
import { getRequest } from "@tanstack/react-start/server";

export const getOrgEventsFn = createServerFn().handler(async () => {
    const request = getRequest();
    return await api.get<any>("/v1/events", { from: new URL(request.url).pathname });
});
