import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['teacher', 'student']),
  googleId: z.string().optional(),
  passwordHash: z.string().optional(),
  country: z.string().optional(), // For currency detection
  currency: z.enum(['INR', 'USD']).optional(), // Based on geolocation
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['teacher', 'student']),
  googleId: z.string().optional(),
  passwordHash: z.string().optional(),
  country: z.string().optional(),
  currency: z.enum(['INR', 'USD']).optional(),
});

// Assignment Schema
export const assignmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  mode: z.enum(['voice', 'voice_text']),
  facultyName: z.string(),
  collegeName: z.string(),
  subjectName: z.string(),
  subjectCode: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  expireAt: z.string(),
  autoDelete: z.boolean(),
  teacherId: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    answerKey: z.string(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertAssignmentSchema = z.object({
  title: z.string().min(3),
  mode: z.enum(['voice', 'voice_text']),
  facultyName: z.string().min(1),
  collegeName: z.string().min(1),
  subjectName: z.string().min(1),
  subjectCode: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  autoDelete: z.boolean().default(true),
  teacherId: z.string().optional(),
  questions: z.array(z.object({
    text: z.string().min(3),
    answerKey: z.string().min(1),
  })).min(1),
});

// Submission Schema
export const submissionSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  studentId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    text: z.string(),
    sttMeta: z.any().optional(),
  })),
  scores: z.array(z.object({
    questionId: z.string(),
    similarity: z.number(),
    awarded: z.number(),
  })),
  totalAwarded: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertSubmissionSchema = z.object({
  assignmentCode: z.string().min(4),
  answers: z.array(z.object({
    questionId: z.string(),
    text: z.string().min(1),
    sttMeta: z.any().optional(),
  })),
});

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['teacher', 'student']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Token Wallet Schema
export const tokenWalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.number().default(0), // Token balance
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertTokenWalletSchema = z.object({
  userId: z.string(),
  balance: z.number().default(0),
});

// Transaction Schema (for token deductions and purchases)
export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['purchase', 'deduction']), // Purchase tokens or deduct for assignment
  tokens: z.number(), // Number of tokens involved
  amount: z.number().optional(), // Money amount for purchases
  currency: z.enum(['INR', 'USD']).optional(),
  assignmentId: z.string().optional(), // For deductions
  paymentId: z.string().optional(), // Link to payment record
  description: z.string().optional(),
  balanceAfter: z.number(), // Token balance after transaction
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertTransactionSchema = z.object({
  userId: z.string(),
  type: z.enum(['purchase', 'deduction']),
  tokens: z.number(),
  amount: z.number().optional(),
  currency: z.enum(['INR', 'USD']).optional(),
  assignmentId: z.string().optional(),
  paymentId: z.string().optional(),
  description: z.string().optional(),
  balanceAfter: z.number(),
});

// Payment Schema (RazorPay orders and receipts)
export const paymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  amount: z.number(), // Amount in smallest currency unit (paise/cents)
  currency: z.enum(['INR', 'USD']),
  tokens: z.number(), // Number of tokens purchased
  status: z.enum(['created', 'paid', 'failed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertPaymentSchema = z.object({
  userId: z.string(),
  razorpayOrderId: z.string(),
  amount: z.number(),
  currency: z.enum(['INR', 'USD']),
  tokens: z.number(),
  status: z.enum(['created', 'paid', 'failed', 'cancelled']).default('created'),
});

// Payment verification schema
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Token purchase request schema
export const tokenPurchaseSchema = z.object({
  tokens: z.number().min(1).max(1000), // Min 1, max 1000 tokens per purchase
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type TokenWallet = z.infer<typeof tokenWalletSchema>;
export type InsertTokenWallet = z.infer<typeof insertTokenWalletSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
