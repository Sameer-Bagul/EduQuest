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

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;