import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./logger";

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json.bind(res);
    res.json = ((bodyJson: unknown) => {
      capturedJsonResponse = bodyJson as Record<string, unknown> | undefined;
      return originalResJson(bodyJson);
    }) as typeof res.json;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = `${logLine.slice(0, 79)}…`;
        }

        log(logLine);
      }
    });

    next();
  });

  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  return app;
}
