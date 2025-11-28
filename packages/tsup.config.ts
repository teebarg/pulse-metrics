import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    clean: true,
    sourcemap: true,
    splitting: false,
    minify: false,
    external: ["react"],
    target: "es2020",
    bundle: true,
    silent: false,
    dts: {
        resolve: true,
    },
    // Ensure proper file extensions
    outExtension({ format }) {
        return {
            js: format === "cjs" ? ".cjs" : ".js",
        };
    },
});
