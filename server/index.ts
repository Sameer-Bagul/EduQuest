import './env.js';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";


const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Registering routes...');
    const server = await registerRoutes(app);
    console.log('Routes registered successfully');

  app.use((err: Error | unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as any)?.status || (err as any)?.statusCode || 500;
    const message = (err as Error)?.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // API server runs on different port than frontend
  const port = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`API server running on port ${port}`);
  });
 } catch (error) {
   console.error('Failed to start server:', error);
   process.exit(1);
 }
})();
