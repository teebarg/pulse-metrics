"use client";

import React, { createContext, useContext } from "react";
import { getWSClient } from "~/lib/ws";

const WSContext = createContext(getWSClient());

export const WSProvider = ({ children }: { children: React.ReactNode }) => {
    return <WSContext.Provider value={getWSClient()}>{children}</WSContext.Provider>;
};

export const useWS = () => {
    const context = useContext(WSContext);

    if (!context) {
        throw new Error("useWS must be used within a WSProvider");
    }

    return context;
};
