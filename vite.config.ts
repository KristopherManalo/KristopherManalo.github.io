import { defineConfig } from "vite";
import { resolve } from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
    base: "/",

    plugins: [
        viteStaticCopy({
            targets: [
                { src: "scripts/*", dest: "./"},
                { src: "components/*", dest: "./"},
            ],
        }),
    ],

    build: {
        rollupOptions: {
            input: {
                portifolio: resolve(import.meta.dirname, "index.html"),
                simulator: resolve(import.meta.dirname, "simulator/index.html")
            }
        }
    }
});