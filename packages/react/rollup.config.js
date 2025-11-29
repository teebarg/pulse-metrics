import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default [
    // ES Module
    {
        input: "src/index.ts",
        output: {
            dir: "dist",
            format: "esm",
            sourcemap: true,
            preserveModules: true,
            preserveModulesRoot: "src",
        },
        external: ["react", "react-dom"],
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
            dir: "dist",
            format: "cjs",
            sourcemap: true,
            exports: "named",
            preserveModules: true,
            preserveModulesRoot: "src",
        },
        external: ["react", "react-dom"],
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
            production && terser(),
        ],
    },
];
