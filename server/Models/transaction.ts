import { z } from "zod";

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

// Type exports
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;