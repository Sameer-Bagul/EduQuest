import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { storage } from "./storage";
import { registerApiRoutes } from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  }));

  // Register modular routes
  registerApiRoutes(app);

  // Auto-cleanup job for expired assignments
  if (process.env.USE_CRON_FALLBACK === 'true') {
    setInterval(async () => {
      try {
        const expiredAssignments = await storage.getExpiredAssignments();
        for (const assignment of expiredAssignments) {
          await storage.deleteAssignment(assignment.id);
          console.log(`Deleted expired assignment: ${assignment.code}`);
        }
      } catch (error) {
        console.error('Auto-cleanup error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  const httpServer = createServer(app);
  return httpServer;
}
