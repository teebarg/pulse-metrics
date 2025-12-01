import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
    // ES Module build (for modern bundlers)
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.esm.js",
            format: "esm",
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: true,
                declarationDir: "dist",
                rootDir: "src",
            }),
        ],
    },

    // CommonJS build (for Node.js)
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            format: "cjs",
            sourcemap: true,
            exports: "default",
        },
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
        ],
    },

    // UMD build (for CDN/browser <script> tags)
    {
        input: "src/index.ts",
        output: {
            file: "dist/sdk.js",
            format: "umd",
            name: "PulseMetrics",
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
            production &&
                terser({
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ["console.log"],
                    },
                }),
        ],
    },
];
