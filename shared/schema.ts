import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['teacher', 'student']),
  googleId: z.string().optional(),
  passwordHash: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['teacher', 'student']),
  googleId: z.string().optional(),
  passwordHash: z.string().optional(),
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

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
