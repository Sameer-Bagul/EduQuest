import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type Response } from "express";

export interface TokenPayload {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
}

const JWT_SECRET = '29f5f506971d8ec66e86e538c865c5f752bf12ae2ca81b62d60da274bc249213c8f41591fcb14e8911198209c67431e2fe692e5dc256c4fbef8667cb02a72512';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token');
}