import { type User, type InsertUser } from "./Models/user";
import { type Assignment, type InsertAssignment } from "./Models/assignment";
import { type Submission, type InsertSubmission } from "./Models/submission";
import { type TokenWallet, type InsertTokenWallet } from "./Models/tokenWallet";
import { type Transaction, type InsertTransaction } from "./Models/transaction";
import { type Payment, type InsertPayment } from "./Models/payment";
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

// Create storage instance with fallback
function createStorage(): IStorage {
  // Try to use MongoDB if connection string is available
  if (process.env.MONGODB_URI) {
    console.log('Using MongoDB storage');
    return new MongoStorage();
  } else {
    console.log('MONGODB_URI not found - using memory storage (temporary fallback)');
    console.log('To use MongoDB, set the MONGODB_URI environment variable');
    return new MemoryStorage();
  }
}

export const storage: IStorage = createStorage();