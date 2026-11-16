import { defineConfig, Plugin } from "vite";
import { resolve } from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "node:fs";
import path from "node:path";

function directoryIndexPlugin(targetSubDir = ""): Plugin {
    const generateHTML = (dirPath: string) => {
        const files = fs.readdirSync(dirPath).filter((f) => f !== "index.html");
        const links = files
            .map((f) => `<li><a href="./${encodeURIComponent(f)}">${f}</a></li>`)
            .join("\n");

    return `<!DOCTYPE html>
<html>
    <body>
        <h1>Index of /${targetSubDir}</ht1>
        <ul>${links}</ul>
    </body>
</html>
`
    };
    return {
        name: "vite-plugin-directory-index",

        // dev: serves generated html for /[targetSubDir]
        configureServer(server) {
            const route = `/${targetSubDir.replace(/^\/|\/$/g, "")}`;
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split("?")[0];
                if (url === route || url === `${route}/`) {
                    // Checks public/misc first, falls back to root misc/
                    const publicDir = path.resolve(import.meta.dirname, "public", targetSubDir);
                    const rootDir = path.resolve(import.meta.dirname, targetSubDir);
                    const targetDir = fs.existsSync(publicDir) ? publicDir : rootDir;

                    if (fs.existsSync(targetDir)) {
                        res.setHeader("Content-Type", "text/html");
                        res.end(generateHTML(targetDir));
                        return;
                    }
                }
                next();
            });
        },

        // build: writes into dist/[targetSubDir]
        closeBundle() {
            const outDir = path.resolve(import.meta.dirname, "dist", targetSubDir);
            if (fs.existsSync(outDir)) {
                fs.writeFileSync(path.join(outDir, "index.html"), generateHTML(outDir));
            }
        }

    }
}



export default defineConfig({
    base: "/",

    plugins: [
        viteStaticCopy({
            targets: [
                { src: "scripts/*", dest: "./"},
                { src: "components/*", dest: "./"},
            ],
        }),
        directoryIndexPlugin("misc"),
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