import { z } from "zod";

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

// Type exports
export type Assignment = z.infer<typeof assignmentSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;