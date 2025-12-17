import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
    server: {
        port: 5174,
    },
    plugins: [
        nitro(),
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tailwindcss(),
        tanstackStart(),
        tanstackRouter({
            autoCodeSplitting: true,
        }),
        viteReact(),
    ],
});
