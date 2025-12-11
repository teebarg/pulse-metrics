import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationFn } from "~/server-fn/organization.fn";

type OrganizationContextType = {
    data?: any | null;
    loading: boolean;
    error: any;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["organization"],
        queryFn: () => getOrganizationFn(),
    });
    console.log("🚀 ~ OrganizationProvider ~ isLoading:", isLoading)
    console.log("🚀 ~ OrganizationProvider ~ data:", data)
    console.log("🚀 ~ OrganizationProvider ~ error:", error)

    return <OrganizationContext.Provider value={{ data, loading: isLoading, error }}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
    const ctx = useContext(OrganizationContext);

    if (!ctx) throw new Error("useOrganization must be used within a StoreProvider");

    return ctx;
};
