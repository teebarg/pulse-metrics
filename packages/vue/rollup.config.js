import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default [
    // ES Module
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.esm.js",
            format: "esm",
            sourcemap: true,
        },
        external: ["vue"],
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

    // CommonJS
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
        external: ["vue"],
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
            production && terser(),
        ],
    },
];
