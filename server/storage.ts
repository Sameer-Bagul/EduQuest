import { 
  type User, type InsertUser, 
  type Assignment, type InsertAssignment, 
  type Submission, type InsertSubmission,
  type TokenWallet, type InsertTokenWallet,
  type Transaction, type InsertTransaction,
  type Payment, type InsertPayment
} from "@shared/schema";
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

// Create storage instance with fallback - lazy initialization
let storageInstance: IStorage | null = null;

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