import { defineConfig } from "vite";
import { resolve } from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
    base: "/",

    plugins: [
        viteStaticCopy({
            targets: [
                { src: "scripts/*", dest: "scripts"},
            ],
        }),
    ],

    build: {
        rollupOptions: {
            input: {
                portifolio: resolve(__dirname, "index.html"),
                simulator: resolve(__dirname, "simulator/index.html")
            }
        }
    }
});