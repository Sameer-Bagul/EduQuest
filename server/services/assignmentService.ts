import { storage } from '../storage';
import type { Assignment, InsertAssignment } from '@shared/schema';

export class AssignmentService {
  async createAssignment(assignmentData: InsertAssignment & { teacherId: string }): Promise<Assignment> {
    // Generate unique 6-digit code
    const code = this.generateAssignmentCode();
    
    return storage.createAssignment({
      ...assignmentData,
      code
    });
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const assignment = await storage.getAssignment(id);
    return assignment || null;
  }

  async getAssignmentByCode(code: string): Promise<Assignment | null> {
    const assignment = await storage.getAssignmentByCode(code);
    return assignment || null;
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return storage.getAssignmentsByTeacher(teacherId);
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    const assignment = await storage.updateAssignment(id, updates);
    return assignment || null;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return storage.deleteAssignment(id);
  }

  async getExpiredAssignments(): Promise<Assignment[]> {
    return storage.getExpiredAssignments();
  }

  private generateAssignmentCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}