import { z } from "zod";

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

// Type exports
export type TokenWallet = z.infer<typeof tokenWalletSchema>;
export type InsertTokenWallet = z.infer<typeof insertTokenWalletSchema>;