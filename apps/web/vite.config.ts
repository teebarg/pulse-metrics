import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
    server: {
        port: 5174,
    },
    plugins: [
        viteTsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tanstackStart(),
        nitro(),
        devtools(),
        tailwindcss(),
        viteReact(),
        tanstackRouter({
            autoCodeSplitting: true,
        }),
    ],
});
