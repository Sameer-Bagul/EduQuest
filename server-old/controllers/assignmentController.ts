import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService';
import { insertAssignmentSchema } from '@shared/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

export class AssignmentController {
  private assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = insertAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const assignment = await this.assignmentService.createAssignment({
        ...parsed.data,
        teacherId: req.user!.id
      });

      res.json({ assignment });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  }

  async getByTeacher(req: AuthenticatedRequest, res: Response) {
    try {
      const assignments = await this.assignmentService.getAssignmentsByTeacher(req.user!.id);
      res.json({ assignments });
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ error: 'Failed to get assignments' });
    }
  }

  async getByCode(req: Request, res: Response) {
    try {
      const assignment = await this.assignmentService.getAssignmentByCode(req.params.code);
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
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.assignmentService.deleteAssignment(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete assignment error:', error);
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  }

  async cleanupExpired() {
    try {
      const expiredAssignments = await this.assignmentService.getExpiredAssignments();
      for (const assignment of expiredAssignments) {
        await this.assignmentService.deleteAssignment(assignment.id);
        console.log(`Deleted expired assignment: ${assignment.code}`);
      }
    } catch (error) {
      console.error('Auto-cleanup error:', error);
    }
  }
}