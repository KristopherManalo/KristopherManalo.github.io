import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
    base: "/",

    build: {
        rollupOptions: {
            input: {
                portifolio: resolve(__dirname, "index.html"),
                simulator: resolve(__dirname, "simulator/index.html")
            }
        }
    }
});