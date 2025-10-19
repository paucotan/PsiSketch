import type { Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import type { Server } from "http";
import react from "@vitejs/plugin-react";
import { nanoid } from "nanoid";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, "..");
const clientRoot = path.resolve(repoRoot, "client");

export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  } as const;

  const vite = await createViteServer({
    configFile: false,
    root: clientRoot,
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          (await import("tailwindcss")).default({
            config: path.resolve(repoRoot, "tailwind.config.ts"),
          }),
          (await import("autoprefixer")).default(),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(clientRoot, "src"),
        "@shared": path.resolve(repoRoot, "shared"),
      },
      preserveSymlinks: false,
    },
    optimizeDeps: {
      entries: [
        path.resolve(clientRoot, "index.html"),
        path.resolve(clientRoot, "src", "**", "*.{ts,tsx}"),
      ],
    },
    server: {
      ...serverOptions,
      fs: {
        allow: [repoRoot],
      },
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(clientRoot, "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
