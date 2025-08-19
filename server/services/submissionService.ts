import { storage } from '../storage';
import { SimilarityService } from './similarityService';
import type { Submission, Assignment, InsertSubmission } from '@shared/schema';

export class SubmissionService {
  private similarityService: SimilarityService;

  constructor() {
    this.similarityService = new SimilarityService();
  }

  async createSubmission(submissionData: InsertSubmission): Promise<Submission> {
    return storage.createSubmission(submissionData);
  }

  async createSubmissionWithScoring(
    assignment: Assignment, 
    studentId: string, 
    answers: { questionId: string; text: string; sttMeta?: any }[]
  ): Promise<{ submission: Submission; scores: { questionId: string; similarity: number; awarded: number }[]; totalAwarded: number }> {
    // Calculate scores for each answer
    const scores = answers.map((answer) => {
      const question = assignment.questions.find(q => q.id === answer.questionId);
      if (!question) {
        return { questionId: answer.questionId, similarity: 0, awarded: 0 };
      }
      
      const similarity = this.similarityService.calculateSimilarity(answer.text, question.answerKey);
      const awarded = similarity >= 0.7 ? 1 : 0; // Threshold for passing

      return { questionId: answer.questionId, similarity, awarded };
    });

    // Calculate total awarded points
    const totalAwarded = scores.reduce((sum, score) => sum + score.awarded, 0);

    // Create submission
    const submission = await this.createSubmission({
      assignmentId: assignment.id,
      studentId,
      answers,
      scores,
      totalAwarded
    });

    return { submission, scores, totalAwarded };
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    const submission = await storage.getSubmission(id);
    return submission || null;
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return storage.getSubmissionsByStudent(studentId);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return storage.getSubmissionsByAssignment(assignmentId);
  }

  async getSubmissionByAssignmentAndStudent(
    assignmentId: string, 
    studentId: string
  ): Promise<Submission | null> {
    const submissions = await this.getSubmissionsByStudent(studentId);
    return submissions.find(s => s.assignmentId === assignmentId) || null;
  }


}