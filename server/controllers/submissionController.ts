import { Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import { AssignmentService } from '../services/assignmentService';
import { insertSubmissionSchema } from '@shared/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

export class SubmissionController {
  private submissionService: SubmissionService;
  private assignmentService: AssignmentService;

  constructor() {
    this.submissionService = new SubmissionService();
    this.assignmentService = new AssignmentService();
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = insertSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { assignmentCode, answers } = parsed.data;

      // Get assignment
      const assignment = await this.assignmentService.getAssignmentByCode(assignmentCode);
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
      const existingSubmission = await this.submissionService.getSubmissionByAssignmentAndStudent(
        assignment.id, 
        req.user!.id
      );
      if (existingSubmission) {
        return res.status(409).json({ error: 'Assignment already submitted' });
      }

      // Create submission with scoring
      const result = await this.submissionService.createSubmissionWithScoring(
        assignment,
        req.user!.id,
        answers
      );

      res.json(result);
    } catch (error) {
      console.error('Submit assignment error:', error);
      res.status(500).json({ error: 'Failed to submit assignment' });
    }
  }

  async getByStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const submissions = await this.submissionService.getSubmissionsByStudent(req.user!.id);
      res.json({ submissions });
    } catch (error) {
      console.error('Get student submissions error:', error);
      res.status(500).json({ error: 'Failed to get submissions' });
    }
  }

  async getByAssignment(req: AuthenticatedRequest, res: Response) {
    try {
      const submissions = await this.submissionService.getSubmissionsByAssignment(req.params.assignmentId);
      res.json({ submissions });
    } catch (error) {
      console.error('Get assignment submissions error:', error);
      res.status(500).json({ error: 'Failed to get submissions' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const submission = await this.submissionService.getSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json({ submission });
    } catch (error) {
      console.error('Get submission error:', error);
      res.status(500).json({ error: 'Failed to get submission' });
    }
  }
}