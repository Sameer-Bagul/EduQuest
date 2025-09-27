import { z } from "zod";

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

// Type exports
export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;