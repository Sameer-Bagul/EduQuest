import { z } from "zod";

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