import { z } from "zod";

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

// Type exports
export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;