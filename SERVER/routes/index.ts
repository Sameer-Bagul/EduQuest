import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerRoutes as registerApiRoutes } from "../routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use the existing routes from routes.ts
  const httpServer = await registerApiRoutes(app);
  return httpServer;
}