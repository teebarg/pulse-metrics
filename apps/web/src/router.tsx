import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import * as TanstackQuery from "~/providers/root-provider";

export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: { ...rqContext },
        defaultPreload: "intent",
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        Wrap: (props: { children: React.ReactNode }) => {
            return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
        },
    });

    setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

    return router;
};
