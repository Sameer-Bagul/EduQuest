import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import { storage } from "./storage";
import { requireAuth, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import { generateToken, hashPassword, comparePassword, setAuthCookie, clearAuthCookie } from "./services/auth";
import { calculateSimilarity } from "./services/similarity";
import { PaymentController } from "./controllers/paymentController";
import { paymentService } from "./services/paymentService";
import { registerSchema, loginSchema, insertAssignmentSchema, insertSubmissionSchema } from "@shared/schema";
import { analyzeAnswer } from "./services/similarity";
import { generateStudentFeedback, generateTeacherReport, detectPlagiarismAcrossSubmissions } from "./services/feedbackGenerator";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  }));

  // College routes
  app.get('/api/colleges', async (req, res) => {
    try {
      const query = req.query.q as string;
      let colleges;
      
      if (query && query.trim()) {
        colleges = await storage.searchColleges(query.trim());
      } else {
        colleges = await storage.getAllColleges();
      }
      
      res.json(colleges);
    } catch (error) {
      console.error('Get colleges error:', error);
      res.status(500).json({ error: 'Failed to fetch colleges' });
    }
  });

  app.get('/api/colleges/:id', async (req, res) => {
    try {
      const college = await storage.getCollege(req.params.id);
      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }
      res.json(college);
    } catch (error) {
      console.error('Get college error:', error);
      res.status(500).json({ error: 'Failed to fetch college' });
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { name, email, password, role, collegeId } = parsed.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Verify college exists
      const college = await storage.getCollege(collegeId);
      if (!college) {
        return res.status(400).json({ error: 'Invalid college selected' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        role,
        collegeId,
        passwordHash,
        tokenBalance: 0,
        totalAssignments: 0,
      });

      // Generate token and set cookie
      const token = generateToken({ id: user.id, role: user.role, email: user.email, name: user.name });
      setAuthCookie(res, token);

      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          collegeId: user.collegeId,
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
      const token = generateToken({ id: user.id, role: user.role, email: user.email, name: user.name });
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

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name,
          email: user.email, 
          role: user.role,
          collegeId: user.collegeId,
          tokenBalance: user.tokenBalance,
          totalAssignments: user.totalAssignments,
        } 
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
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

  // Configure multer for avatar uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Profile management routes
  app.put('/api/auth/profile', requireAuth, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user!.id;
      
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: 'Email already in use by another account' });
        }
      }
      
      // Update user profile
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await storage.updateUser(userId, { 
        name: name || currentUser.name, 
        email: email || currentUser.email 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'Failed to update user' });
      }
      
      // Handle avatar upload if present
      if (req.file) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        const extension = req.file.mimetype.split('/')[1];
        const fileName = `${userId}.${extension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Save avatar file
        fs.writeFileSync(filePath, req.file.buffer);
      }
      
      res.json({ 
        user: { 
          id: updatedUser.id, 
          name: updatedUser.name, 
          email: updatedUser.email, 
          role: updatedUser.role 
        } 
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });
  
  app.put('/api/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      
      // Get user and verify current password
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const validPassword = await comparePassword(currentPassword, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await storage.updateUser(userId, { passwordHash: newPasswordHash });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });
  
  app.get('/api/auth/avatar/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      
      // Try different image formats
      const extensions = ['jpg', 'jpeg', 'png', 'gif'];
      let avatarPath = null;
      
      for (const ext of extensions) {
        const filePath = path.join(avatarDir, `${userId}.${ext}`);
        if (fs.existsSync(filePath)) {
          avatarPath = filePath;
          break;
        }
      }
      
      if (!avatarPath) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      res.sendFile(avatarPath);
    } catch (error) {
      console.error('Get avatar error:', error);
      res.status(500).json({ error: 'Failed to get avatar' });
    }
  });

  // User settings routes (for settings page)
  app.patch('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user!.id;
      
      if (!name && !email) {
        return res.status(400).json({ error: 'At least one field (name or email) is required' });
      }
      
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: 'Email already in use by another account' });
        }
      }
      
      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user profile
      const updatedUser = await storage.updateUser(userId, { 
        ...(name && { name }), 
        ...(email && { email })
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      
      res.json({ 
        user: { 
          id: updatedUser.id, 
          name: updatedUser.name, 
          email: updatedUser.email, 
          role: updatedUser.role 
        } 
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.patch('/api/user/password', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      
      // Get user and verify current password
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const validPassword = await comparePassword(currentPassword, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await storage.updateUser(userId, { passwordHash: newPasswordHash });
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  app.delete('/api/user/account', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user to verify existence
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // TODO: Implement cascade deletion for assignments and submissions
      // For now, we'll just mark the account as deleted in a production environment
      // In a real implementation, you would want to:
      // 1. Delete user's assignments if teacher
      // 2. Delete user's submissions if student  
      // 3. Handle wallet and transaction cleanup
      
      // For demo purposes, we'll just clear the session
      // In production, you'd want proper cascade deletion or soft delete
      clearAuthCookie(res);
      
      res.json({ success: true, message: 'Account deletion initiated. Please contact support to complete the process.' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Assignment routes
  app.post('/api/assignments', requireAuth, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = insertAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const assignmentCode = Math.floor(100000 + Math.random() * 900000).toString();
      const assignment = await storage.createAssignment({
        ...parsed.data,
        teacherId: req.user!.id,
        code: assignmentCode
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

  // Get individual assignment by ID (for viewing)
  app.get('/api/assignments/:id', requireAuth, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Check if teacher owns this assignment
      if (assignment.teacherId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ assignment });
    } catch (error) {
      console.error('Get assignment error:', error);
      res.status(500).json({ error: 'Failed to get assignment' });
    }
  });

  // Update assignment (for editing)
  app.put('/api/assignments/:id', requireAuth, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Check if teacher owns this assignment
      if (assignment.teacherId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const parsed = insertAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      // Add IDs to questions if they don't have them
      const dataWithIds = {
        ...parsed.data,
        questions: parsed.data.questions.map(q => ({
          ...q,
          id: ('id' in q && typeof q.id === 'string') ? q.id : Math.random().toString(36).substring(2, 15)
        }))
      };
      
      const updatedAssignment = await storage.updateAssignment(req.params.id, dataWithIds);
      if (!updatedAssignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json({ assignment: updatedAssignment });
    } catch (error) {
      console.error('Update assignment error:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  });

  // Payment and Token routes
  app.post('/api/payments/create-order', requireAuth, PaymentController.createTokenPurchaseOrder);
  app.post('/api/payments/verify', requireAuth, PaymentController.verifyPayment);
  app.get('/api/payments/history', requireAuth, PaymentController.getPaymentHistory);
  app.get('/api/transactions/history', requireAuth, PaymentController.getTransactionHistory);
  app.get('/api/wallet', requireAuth, PaymentController.getTokenWallet);
  app.get('/api/assignments/:assignmentId/cost', requireAuth, PaymentController.calculateAssignmentCost);

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

      // Calculate tokens required for this assignment
      const tokensRequired = paymentService.calculateTokensRequired(assignment.questions.length);
      
      // Deduct tokens atomically (this will check balance and create transaction)
      let tokenDeduction;
      try {
        tokenDeduction = await storage.deductTokensForAssignment(
          req.user!.id, 
          tokensRequired, 
          assignment.id
        );
      } catch (error) {
        if (error instanceof Error && error.message === 'Insufficient token balance') {
          // Get user's current balance for error message
          const wallet = await storage.getTokenWallet(req.user!.id);
          const currentBalance = wallet?.balance || 0;
          
          return res.status(402).json({ 
            error: 'Insufficient token balance',
            details: {
              required: tokensRequired,
              current: currentBalance,
              shortfall: tokensRequired - currentBalance
            }
          });
        }
        throw error;
      }

      // Grade answers using advanced NLP analysis
      const threshold = 0.70;
      const marksPerQuestion = 1;

      // Enhanced scoring with detailed feedback
      const scores = await Promise.all(
        answers.map(async (answer) => {
          const question = assignment.questions.find(q => q.id === answer.questionId);
          if (!question) {
            return { 
              questionId: answer.questionId, 
              similarity: 0, 
              awarded: 0,
              feedback: {
                overallScore: 0,
                strengths: [],
                improvements: ['Answer not found'],
                keywordAnalysis: { matched: [], missed: [], suggestions: [] },
                detailedComments: 'Question not found in assignment',
                plagiarismRisk: 'low' as const
              }
            };
          }

          // Perform comprehensive analysis
          const analysis = analyzeAnswer(answer.text, question.answerKey);
          const similarity = analysis.overallSimilarity;
          const awarded = similarity >= threshold ? marksPerQuestion : 0;

          // Generate detailed student feedback
          const feedback = generateStudentFeedback(
            answer.text,
            question.answerKey,
            similarity,
            analysis
          );

          return { 
            questionId: answer.questionId, 
            similarity, 
            awarded,
            feedback,
            analysis: {
              cosineSimilarity: analysis.cosineSimilarity,
              semanticSimilarity: analysis.semanticSimilarity,
              keywordMatch: analysis.keywordMatch,
              contextualAccuracy: analysis.contextualAccuracy
            }
          };
        })
      );

      const totalAwarded = scores.reduce((sum, score) => sum + score.awarded, 0);

      // Create submission
      const submission = await storage.createSubmission({
        assignmentId: assignment.id,
        studentId: req.user!.id,
        answers,
        scores: scores.map(s => ({ questionId: s.questionId, similarity: s.similarity, awarded: s.awarded })),
        totalAwarded
      });

      res.json({ 
        submission, 
        scores, 
        totalAwarded,
        tokensDeducted: tokensRequired,
        newTokenBalance: tokenDeduction.wallet.balance,
        detailedFeedback: scores.map(s => ({
          questionId: s.questionId,
          feedback: s.feedback,
          analysis: s.analysis
        }))
      });
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

  // Teacher report endpoint with plagiarism detection
  app.get('/api/assignments/:assignmentId/report', requireAuth, requireRole('teacher'), async (req, res) => {
    try {
      const assignment = await storage.getAssignment(req.params.assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const submissions = await storage.getSubmissionsByAssignment(req.params.assignmentId);
      
      // Generate reports for each question
      const questionReports = assignment.questions.map(question => {
        const questionSubmissions = submissions.map(sub => {
          const answer = sub.answers.find(a => a.questionId === question.id);
          const score = sub.scores.find(s => s.questionId === question.id);
          
          return {
            studentId: sub.studentId,
            answer: answer?.text || '',
            score: score?.awarded || 0,
            similarity: score?.similarity || 0
          };
        }).filter(s => s.answer);

        return generateTeacherReport(
          question.id,
          question.text,
          questionSubmissions
        );
      });

      // Detect plagiarism across submissions for each question
      const plagiarismReports = assignment.questions.map(question => {
        const questionSubmissions = submissions.map(sub => ({
          studentId: sub.studentId,
          answer: sub.answers.find(a => a.questionId === question.id)?.text || ''
        })).filter(s => s.answer);

        const plagiarismCases = detectPlagiarismAcrossSubmissions(questionSubmissions);
        
        return {
          questionId: question.id,
          questionText: question.text,
          plagiarismCases: plagiarismCases.slice(0, 10) // Top 10 suspicious cases
        };
      });

      res.json({
        assignment: {
          id: assignment.id,
          title: assignment.title,
          code: assignment.code
        },
        totalSubmissions: submissions.length,
        questionReports,
        plagiarismReports: plagiarismReports.filter(r => r.plagiarismCases.length > 0)
      });
    } catch (error) {
      console.error('Get assignment report error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
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

  // Seed colleges if database is empty
  async function seedColleges() {
    try {
      const colleges = await storage.getAllColleges();
      if (colleges.length === 0) {
        console.log('Seeding colleges...');
        const sampleColleges = [
          { name: 'Massachusetts Institute of Technology', location: 'Cambridge, MA', country: 'United States', type: 'university' as const },
          { name: 'Stanford University', location: 'Stanford, CA', country: 'United States', type: 'university' as const },
          { name: 'Harvard University', location: 'Cambridge, MA', country: 'United States', type: 'university' as const },
          { name: 'University of California, Berkeley', location: 'Berkeley, CA', country: 'United States', type: 'university' as const },
          { name: 'Indian Institute of Technology Bombay', location: 'Mumbai', country: 'India', type: 'institute' as const },
          { name: 'Indian Institute of Technology Delhi', location: 'New Delhi', country: 'India', type: 'institute' as const },
          { name: 'Indian Institute of Technology Madras', location: 'Chennai', country: 'India', type: 'institute' as const },
          { name: 'University of Oxford', location: 'Oxford', country: 'United Kingdom', type: 'university' as const },
          { name: 'University of Cambridge', location: 'Cambridge', country: 'United Kingdom', type: 'university' as const },
          { name: 'National University of Singapore', location: 'Singapore', country: 'Singapore', type: 'university' as const },
          { name: 'Tsinghua University', location: 'Beijing', country: 'China', type: 'university' as const },
          { name: 'University of Toronto', location: 'Toronto', country: 'Canada', type: 'university' as const },
          { name: 'Delhi University', location: 'New Delhi', country: 'India', type: 'university' as const },
          { name: 'Mumbai University', location: 'Mumbai', country: 'India', type: 'university' as const },
          { name: 'Bangalore University', location: 'Bangalore', country: 'India', type: 'university' as const },
        ];

        for (const college of sampleColleges) {
          await storage.createCollege(college);
        }
        console.log('Colleges seeded successfully!');
      }
    } catch (error) {
      console.error('Error seeding colleges:', error);
    }
  }

  // Seed colleges on startup
  await seedColleges();

  const httpServer = createServer(app);
  return httpServer;
}
