import {
  type College, type InsertCollege,
  type User, type InsertUser,
  type Assignment, type InsertAssignment,
  type Submission, type InsertSubmission,
  type TokenWallet, type InsertTokenWallet,
  type Transaction, type InsertTransaction,
  type Payment, type InsertPayment
} from "@shared/schema";
import { MongoStorage } from "./storage/mongodb-simple";

export interface IStorage {
  // College operations
  getCollege(id: string): Promise<College | undefined>;
  getAllColleges(): Promise<College[]>;
  searchColleges(query: string): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
  
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

  // Token Wallet operations
  getTokenWallet(userId: string): Promise<TokenWallet | undefined>;
  createTokenWallet(wallet: InsertTokenWallet): Promise<TokenWallet>;
  updateTokenBalance(userId: string, newBalance: number): Promise<TokenWallet | undefined>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Payment operations
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;

  // Atomic operations for token system
  deductTokensForAssignment(userId: string, tokens: number, assignmentId: string): Promise<{wallet: TokenWallet, transaction: Transaction}>;
}

// Create storage instance - MongoDB only
let storageInstance: IStorage | null = null;

function createStorage(): IStorage {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required. Please set your MongoDB Atlas connection string.');
  }

  console.log('Using MongoDB Atlas storage');
  return new MongoStorage();
}

function getStorage(): IStorage {
  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
}

// Export a getter instead of the instance directly
export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    const actualStorage = getStorage();
    const value = (actualStorage as any)[prop];
    if (typeof value === 'function') {
      return value.bind(actualStorage);
    }
    return value;
  }
});