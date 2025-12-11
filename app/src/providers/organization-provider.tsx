import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationFn } from "~/server-fn/organization.fn";
// import { useAuth } from "./auth-provider";

type OrganizationContextType = {
    data?: any | null;
    loading: boolean;
    error: any;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
    // const { isAuthenticated, session } = useAuth();
    const { data, isLoading, error } = useQuery({
        queryKey: ["organization"],
        queryFn: () => getOrganizationFn({ data: "1" }),
        // enabled: isAuthenticated,
    });

    return <OrganizationContext.Provider value={{ data, loading: isLoading, error }}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
    const ctx = useContext(OrganizationContext);

    if (!ctx) throw new Error("useOrganization must be used within a OrganizationProvider");

    return ctx;
};
