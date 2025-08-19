import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import { AuthController } from "../controllers/authController";
import { AssignmentController } from "../controllers/assignmentController";
import { SubmissionController } from "../controllers/submissionController";
import { requireAuth, requireRole } from "../middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  }));

  // Initialize controllers
  const authController = new AuthController();
  const assignmentController = new AssignmentController();
  const submissionController = new SubmissionController();

  // Auth routes
  app.post('/api/auth/register', (req, res) => authController.register(req, res));
  app.post('/api/auth/login', (req, res) => authController.login(req, res));
  app.post('/api/auth/logout', (req, res) => authController.logout(req, res));
  app.get('/api/auth/me', requireAuth, (req, res) => authController.me(req, res));
  app.get('/api/auth/google', (req, res) => authController.googleAuth(req, res));
  app.get('/api/auth/google/callback', (req, res) => authController.googleCallback(req, res));

  // Assignment routes
  app.post('/api/assignments', requireAuth, requireRole('teacher'), (req, res) => 
    assignmentController.create(req, res));
  app.get('/api/assignments/teacher', requireAuth, requireRole('teacher'), (req, res) => 
    assignmentController.getByTeacher(req, res));
  app.get('/api/assignments/code/:code', requireAuth, (req, res) => 
    assignmentController.getByCode(req, res));
  app.delete('/api/assignments/:id', requireAuth, requireRole('teacher'), (req, res) => 
    assignmentController.delete(req, res));

  // Submission routes
  app.post('/api/submissions', requireAuth, requireRole('student'), (req, res) => 
    submissionController.create(req, res));
  app.get('/api/submissions/student', requireAuth, requireRole('student'), (req, res) => 
    submissionController.getByStudent(req, res));
  app.get('/api/submissions/assignment/:assignmentId', requireAuth, requireRole('teacher'), (req, res) => 
    submissionController.getByAssignment(req, res));
  app.get('/api/submissions/:id', requireAuth, (req, res) => 
    submissionController.getById(req, res));

  // Auto-cleanup job for expired assignments
  if (process.env.USE_CRON_FALLBACK === 'true') {
    setInterval(async () => {
      await assignmentController.cleanupExpired();
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  const httpServer = createServer(app);
  return httpServer;
}