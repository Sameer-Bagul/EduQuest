import type { Express } from "express";
import { registerAuthRoutes } from "./authRoutes";
import { registerAssignmentRoutes } from "./assignmentRoutes";
import { registerSubmissionRoutes } from "./submissionRoutes";
import { registerPaymentRoutes } from "./paymentRoutes";

export function registerApiRoutes(app: Express) {
  // Register all route modules
  registerAuthRoutes(app);
  registerAssignmentRoutes(app);
  registerSubmissionRoutes(app);
  registerPaymentRoutes(app);
}