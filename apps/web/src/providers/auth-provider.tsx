import React, { createContext, useContext } from "react";
import { authClient } from "~/lib/auth-client";

type AuthContextType = {
    session?: any | null;
    isAuthenticated: boolean;
    isPending: boolean;
    error: any;
    refetch: (queryParams?: any | undefined) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch, //refetch the session
    } = authClient.useSession();

    return <AuthContext.Provider value={{ session, isAuthenticated: !!session, isPending, error, refetch }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error("useAuth must be used within a AuthProvider");

    return ctx;
};
