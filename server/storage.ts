import { type User, type InsertUser, type Assignment, type InsertAssignment, type Submission, type InsertSubmission } from "@shared/schema";
import { MongoStorage } from "./storage/mongodb-simple";
import { MemoryStorage } from "./storage/memory-fallback";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Assignment operations
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentByCode(code: string): Promise<Assignment | undefined>;
  getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment & { teacherId: string; code: string }): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: string): Promise<boolean>;
  getExpiredAssignments(): Promise<Assignment[]>;

  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  getSubmissionByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission | undefined>;
  createSubmission(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission>;
}

// Create storage instance with fallback
function createStorage(): IStorage {
  // For now, use memory storage to fix the immediate issues
  // User can switch to MongoDB once they fix the IP whitelist
  console.log('Using memory storage (temporary fallback due to MongoDB connection issues)');
  return new MemoryStorage();
}

export const storage: IStorage = createStorage();