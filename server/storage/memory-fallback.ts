import { 
  type User, type InsertUser, 
  type Assignment, type InsertAssignment, 
  type Submission, type InsertSubmission,
  type TokenWallet, type InsertTokenWallet,
  type Transaction, type InsertTransaction,
  type Payment, type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "../storage";

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private tokenWallets: Map<string, TokenWallet> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private payments: Map<string, Payment> = new Map();

  private generateAssignmentCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Assignment operations
  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async getAssignmentByCode(code: string): Promise<Assignment | undefined> {
    return Array.from(this.assignments.values()).find(assignment => assignment.code === code);
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.teacherId === teacherId);
  }

  async createAssignment(data: InsertAssignment & { teacherId: string; code: string }): Promise<Assignment> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    // Calculate expireAt based on endDate and retention policy
    const endDate = new Date(data.endDate);
    const retentionDays = parseInt(process.env.AUTO_DELETE_RETENTION_DAYS || '0');
    const expireAt = new Date(endDate.getTime() + (retentionDays * 24 * 60 * 60 * 1000));

    const assignment: Assignment = {
      ...data,
      id,
      code: data.code,
      expireAt: expireAt.toISOString(),
      questions: data.questions.map(q => ({ ...q, id: randomUUID() })),
      createdAt: now,
      updatedAt: now,
    };
    
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment: Assignment = {
      ...assignment,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return this.assignments.delete(id);
  }

  async getExpiredAssignments(): Promise<Assignment[]> {
    const now = new Date();
    return Array.from(this.assignments.values()).filter(assignment => 
      assignment.autoDelete && new Date(assignment.expireAt) <= now
    );
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(submission => submission.assignmentId === assignmentId);
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(submission => submission.studentId === studentId);
  }

  async getSubmissionByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission | undefined> {
    return Array.from(this.submissions.values()).find(submission => 
      submission.assignmentId === assignmentId && submission.studentId === studentId
    );
  }

  async createSubmission(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const submission: Submission = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.submissions.set(id, submission);
    return submission;
  }

  // Token Wallet operations
  async getTokenWallet(userId: string): Promise<TokenWallet | undefined> {
    return Array.from(this.tokenWallets.values()).find(wallet => wallet.userId === userId);
  }

  async createTokenWallet(insertWallet: InsertTokenWallet): Promise<TokenWallet> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const wallet: TokenWallet = {
      ...insertWallet,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tokenWallets.set(id, wallet);
    return wallet;
  }

  async updateTokenBalance(userId: string, newBalance: number): Promise<TokenWallet | undefined> {
    const wallet = await this.getTokenWallet(userId);
    if (!wallet) return undefined;
    
    const updatedWallet: TokenWallet = {
      ...wallet,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    };
    this.tokenWallets.set(wallet.id, updatedWallet);
    return updatedWallet;
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.userId === userId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Payment operations
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.razorpayOrderId === razorpayOrderId);
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.userId === userId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: Payment = {
      ...payment,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Atomic operations for token system
  async deductTokensForAssignment(userId: string, tokens: number, assignmentId: string): Promise<{wallet: TokenWallet, transaction: Transaction}> {
    // Get current wallet or create if doesn't exist
    let wallet = await this.getTokenWallet(userId);
    if (!wallet) {
      wallet = await this.createTokenWallet({ userId, balance: 0 });
    }

    // Check if user has enough tokens
    if (wallet.balance < tokens) {
      throw new Error('Insufficient token balance');
    }

    // Deduct tokens
    const newBalance = wallet.balance - tokens;
    const updatedWallet = await this.updateTokenBalance(userId, newBalance);
    if (!updatedWallet) {
      throw new Error('Failed to update wallet balance');
    }

    // Create transaction record
    const transaction = await this.createTransaction({
      userId,
      type: 'deduction',
      tokens,
      assignmentId,
      description: `Assignment access: ${assignmentId}`,
      balanceAfter: newBalance,
    });

    return { wallet: updatedWallet, transaction };
  }
}