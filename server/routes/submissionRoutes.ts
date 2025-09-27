import type { Express } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { insertSubmissionSchema } from "../Models/submission";
import { calculateSimilarity } from "../services/similarity";
import { paymentService } from "../services/paymentService";

export function registerSubmissionRoutes(app: Express) {
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
        } else {
          console.error('Token deduction error:', error);
          return res.status(500).json({ error: 'Failed to process payment' });
        }
      }

      // Grade answers using NLP similarity
      const threshold = 0.70;
      const marksPerQuestion = 1;

      const scores = await Promise.all(
        answers.map(async (answer) => {
          const question = assignment.questions.find((q: any) => q.id === answer.questionId);
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

      res.json({
        submission,
        scores,
        totalAwarded,
        tokensDeducted: tokensRequired,
        newTokenBalance: tokenDeduction.wallet.balance
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
}