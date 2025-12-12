import { createServerFn } from "@tanstack/react-start";
import { api } from "~/utils/fetch-api";

export const getOrganizationFn = createServerFn().handler(async () => {
    return await api.get<any>("/v1/organization");
});

