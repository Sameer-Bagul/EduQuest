import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import { storage } from "./storage";
import { requireAuth, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import { generateToken, hashPassword, comparePassword, setAuthCookie, clearAuthCookie } from "./services/auth";
import { calculateSimilarity } from "./services/similarity";
import { registerSchema, loginSchema, insertAssignmentSchema, insertSubmissionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  }));

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { name, email, password, role } = parsed.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        role,
        passwordHash
      });

      // Generate token and set cookie
      const token = generateToken({ id: user.id, role: user.role, email: user.email });
      setAuthCookie(res, token);

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { email, password } = parsed.data;

      // Find user and verify password
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token and set cookie
      const token = generateToken({ id: user.id, role: user.role, email: user.email });
      setAuthCookie(res, token);

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ 
      user: { 
        id: req.user!.id, 
        name: req.user!.name, 
        email: req.user!.email, 
        role: req.user!.role 
      } 
    });
  });

  // Google OAuth routes (simplified - in production, use passport-google-oauth20)
  app.get('/api/auth/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_OAUTH_CALLBACK_URL || '')}&` +
      `scope=profile email&` +
      `response_type=code`;
    
    res.redirect(googleAuthUrl);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    // This is a simplified implementation
    // In production, you would exchange the code for tokens and get user info
    res.redirect('/login?google_auth=success');
  });

  // Assignment routes
  app.post('/api/assignments', requireAuth, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = insertAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const assignment = await storage.createAssignment({
        ...parsed.data,
        teacherId: req.user!.id
      });

      res.json({ assignment });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  app.get('/api/assignments/teacher', requireAuth, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
    try {
      const assignments = await storage.getAssignmentsByTeacher(req.user!.id);
      res.json({ assignments });
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ error: 'Failed to get assignments' });
    }
  });

  app.get('/api/assignments/code/:code', requireAuth, async (req, res) => {
    try {
      const assignment = await storage.getAssignmentByCode(req.params.code);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Check if assignment is active
      const now = new Date();
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);

      if (now < startDate) {
        return res.status(403).json({ error: 'Assignment not yet started' });
      }

      if (now > endDate) {
        return res.status(403).json({ error: 'Assignment has ended' });
      }

      res.json({ assignment });
    } catch (error) {
      console.error('Get assignment by code error:', error);
      res.status(500).json({ error: 'Failed to get assignment' });
    }
  });

  // Submission routes
  app.post('/api/submissions', requireAuth, requireRole('student'), async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = insertSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { assignmentCode, answers } = parsed.data;

      // Get assignment
      const assignment = await storage.getAssignmentByCode(assignmentCode);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Check if assignment is active
      const now = new Date();
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);

      if (now < startDate) {
        return res.status(403).json({ error: 'Assignment not yet started' });
      }

      if (now > endDate) {
        return res.status(403).json({ error: 'Assignment has ended' });
      }

      // Check if already submitted
      const existingSubmission = await storage.getSubmissionByAssignmentAndStudent(
        assignment.id, 
        req.user!.id
      );
      if (existingSubmission) {
        return res.status(409).json({ error: 'Assignment already submitted' });
      }

      // Grade answers using NLP similarity
      const threshold = 0.70;
      const marksPerQuestion = 1;

      const scores = await Promise.all(
        answers.map(async (answer) => {
          const question = assignment.questions.find(q => q.id === answer.questionId);
          if (!question) {
            return { questionId: answer.questionId, similarity: 0, awarded: 0 };
          }

          const similarity = await calculateSimilarity(answer.text, question.answerKey);
          const awarded = similarity >= threshold ? marksPerQuestion : 0;

          return { questionId: answer.questionId, similarity, awarded };
        })
      );

      const totalAwarded = scores.reduce((sum, score) => sum + score.awarded, 0);

      // Create submission
      const submission = await storage.createSubmission({
        assignmentId: assignment.id,
        studentId: req.user!.id,
        answers,
        scores,
        totalAwarded
      });

      res.json({ submission, scores, totalAwarded });
    } catch (error) {
      console.error('Submit assignment error:', error);
      res.status(500).json({ error: 'Failed to submit assignment' });
    }
  });

  app.get('/api/submissions/student', requireAuth, requireRole('student'), async (req: AuthenticatedRequest, res) => {
    try {
      const submissions = await storage.getSubmissionsByStudent(req.user!.id);
      res.json({ submissions });
    } catch (error) {
      console.error('Get student submissions error:', error);
      res.status(500).json({ error: 'Failed to get submissions' });
    }
  });

  app.get('/api/submissions/assignment/:assignmentId', requireAuth, requireRole('teacher'), async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByAssignment(req.params.assignmentId);
      res.json({ submissions });
    } catch (error) {
      console.error('Get assignment submissions error:', error);
      res.status(500).json({ error: 'Failed to get submissions' });
    }
  });

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
