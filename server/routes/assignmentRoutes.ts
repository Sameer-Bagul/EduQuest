import type { Express } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { insertAssignmentSchema } from "../Models/assignment";
import crypto from "crypto";

export function registerAssignmentRoutes(app: Express) {
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
          id: ('id' in q && typeof q.id === 'string') ? q.id : crypto.randomUUID()
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
}