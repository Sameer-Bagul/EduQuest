/**
 * Feedback Generation Service
 * Generates detailed feedback for students and comprehensive reports for teachers
 */

import { analyzeAnswer } from './similarity';

export interface DetailedFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  keywordAnalysis: {
    matched: string[];
    missed: string[];
    suggestions: string[];
  };
  detailedComments: string;
  plagiarismRisk: 'low' | 'medium' | 'high';
}

export interface TeacherReport {
  questionId: string;
  questionText: string;
  totalSubmissions: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 90-100%
    good: number; // 70-89%
    average: number; // 50-69%
    poor: number; // 0-49%
  };
  commonMistakes: string[];
  topPerformers: number;
  needsAttention: number;
}

/**
 * Generate detailed feedback for a student's answer
 */
export function generateStudentFeedback(
  studentAnswer: string,
  referenceAnswer: string,
  similarity: number,
  analysisBreakdown: any
): DetailedFeedback {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const suggestions: string[] = [];
  
  // Analyze strengths
  if (analysisBreakdown.keywordMatch > 0.7) {
    strengths.push('Excellent use of key concepts and terminology');
  } else if (analysisBreakdown.keywordMatch > 0.4) {
    strengths.push('Good understanding of main concepts');
  }
  
  if (analysisBreakdown.semanticSimilarity > 0.7) {
    strengths.push('Strong semantic understanding of the topic');
  }
  
  if (analysisBreakdown.contextualAccuracy > 0.7) {
    strengths.push('Well-structured response with relevant context');
  }
  
  if (analysisBreakdown.detailedBreakdown.readabilityScore > 0.6) {
    strengths.push('Clear and readable expression');
  }
  
  // Analyze improvements
  if (analysisBreakdown.keywordMatch < 0.5) {
    improvements.push('Include more key concepts from the lesson');
    analysisBreakdown.detailedBreakdown.missedKeywords.slice(0, 5).forEach((keyword: string) => {
      suggestions.push(`Consider including: "${keyword}"`);
    });
  }
  
  if (analysisBreakdown.semanticSimilarity < 0.6) {
    improvements.push('Try to explain the core concepts in your own words');
  }
  
  if (analysisBreakdown.contextualAccuracy < 0.5) {
    improvements.push('Provide more specific examples and context');
  }
  
  if (analysisBreakdown.detailedBreakdown.readabilityScore < 0.4) {
    improvements.push('Structure your answer with clearer sentences');
  }
  
  const wordCount = studentAnswer.split(/\s+/).length;
  if (wordCount < 20) {
    improvements.push('Provide more detailed explanations (your answer seems brief)');
  }
  
  // Generate overall comment
  let detailedComments = '';
  if (similarity >= 0.9) {
    detailedComments = 'Excellent work! Your answer demonstrates comprehensive understanding of the topic.';
  } else if (similarity >= 0.75) {
    detailedComments = 'Good effort! You have a solid grasp of the main concepts. Focus on incorporating the suggested improvements.';
  } else if (similarity >= 0.6) {
    detailedComments = 'You understand the basics, but there\'s room for improvement. Review the missed concepts and try to explain them in more detail.';
  } else if (similarity >= 0.4) {
    detailedComments = 'Your answer shows some understanding, but needs significant improvement. Review the reference material and ensure you cover all key points.';
  } else {
    detailedComments = 'This answer needs more work. Please review the study materials carefully and make sure you understand the core concepts before attempting again.';
  }
  
  // Assess plagiarism risk
  const plagiarismRisk = assessPlagiarismRisk(studentAnswer, referenceAnswer, similarity);
  
  return {
    overallScore: Math.round(similarity * 100),
    strengths: strengths.length > 0 ? strengths : ['Keep practicing to improve'],
    improvements,
    keywordAnalysis: {
      matched: analysisBreakdown.detailedBreakdown.matchedKeywords,
      missed: analysisBreakdown.detailedBreakdown.missedKeywords,
      suggestions
    },
    detailedComments,
    plagiarismRisk
  };
}

/**
 * Assess plagiarism risk based on answer patterns
 */
function assessPlagiarismRisk(
  studentAnswer: string,
  referenceAnswer: string,
  similarity: number
): 'low' | 'medium' | 'high' {
  // Check for exact or near-exact match
  const normalizedStudent = studentAnswer.toLowerCase().replace(/[^\w\s]/g, '');
  const normalizedReference = referenceAnswer.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Calculate exact match percentage
  const studentWords = normalizedStudent.split(/\s+/);
  const referenceWords = normalizedReference.split(/\s+/);
  
  // Check for consecutive word matches (n-grams)
  let maxConsecutiveMatches = 0;
  let currentConsecutive = 0;
  
  for (let i = 0; i < studentWords.length; i++) {
    const idx = referenceWords.indexOf(studentWords[i]);
    if (idx !== -1 && i > 0 && referenceWords[idx - 1] === studentWords[i - 1]) {
      currentConsecutive++;
      maxConsecutiveMatches = Math.max(maxConsecutiveMatches, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }
  
  // High risk: many consecutive words matching or very high similarity with low variation
  if (maxConsecutiveMatches > 10 || (similarity > 0.95 && studentWords.length > 20)) {
    return 'high';
  }
  
  // Medium risk: moderate consecutive matches
  if (maxConsecutiveMatches > 5 || (similarity > 0.9 && studentWords.length > 15)) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Generate comprehensive report for teachers
 */
export function generateTeacherReport(
  questionId: string,
  questionText: string,
  submissions: Array<{
    studentId: string;
    answer: string;
    score: number;
    similarity: number;
  }>
): TeacherReport {
  const totalSubmissions = submissions.length;
  
  if (totalSubmissions === 0) {
    return {
      questionId,
      questionText,
      totalSubmissions: 0,
      averageScore: 0,
      scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      commonMistakes: [],
      topPerformers: 0,
      needsAttention: 0
    };
  }
  
  // Calculate average score
  const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
  const averageScore = totalScore / totalSubmissions;
  
  // Calculate score distribution
  const scoreDistribution = {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0
  };
  
  submissions.forEach(sub => {
    const percentage = sub.similarity * 100;
    if (percentage >= 90) scoreDistribution.excellent++;
    else if (percentage >= 70) scoreDistribution.good++;
    else if (percentage >= 50) scoreDistribution.average++;
    else scoreDistribution.poor++;
  });
  
  // Identify common patterns in low-scoring answers
  const commonMistakes: string[] = [];
  const poorAnswers = submissions.filter(sub => sub.similarity < 0.6);
  
  if (poorAnswers.length > totalSubmissions * 0.3) {
    commonMistakes.push('Many students are struggling with this concept');
  }
  
  if (scoreDistribution.poor > totalSubmissions * 0.2) {
    commonMistakes.push('Over 20% of students scored below 50% - consider reviewing this topic in class');
  }
  
  if (scoreDistribution.excellent < totalSubmissions * 0.1) {
    commonMistakes.push('Few students achieving excellence - this might be a challenging question');
  }
  
  return {
    questionId,
    questionText,
    totalSubmissions,
    averageScore: Math.round(averageScore * 100) / 100,
    scoreDistribution,
    commonMistakes,
    topPerformers: scoreDistribution.excellent,
    needsAttention: scoreDistribution.poor
  };
}

/**
 * Detect potential plagiarism across multiple submissions
 */
export function detectPlagiarismAcrossSubmissions(
  submissions: Array<{
    studentId: string;
    answer: string;
  }>
): Array<{
  student1: string;
  student2: string;
  similarity: number;
  riskLevel: 'low' | 'medium' | 'high';
}> {
  const plagiarismCases: Array<{
    student1: string;
    student2: string;
    similarity: number;
    riskLevel: 'low' | 'medium' | 'high';
  }> = [];
  
  // Compare each pair of submissions
  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      const analysis = analyzeAnswer(submissions[i].answer, submissions[j].answer);
      const similarity = analysis.overallSimilarity;
      
      // Only flag if similarity is suspiciously high
      if (similarity > 0.85) {
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        
        if (similarity > 0.95) riskLevel = 'high';
        else if (similarity > 0.9) riskLevel = 'medium';
        
        plagiarismCases.push({
          student1: submissions[i].studentId,
          student2: submissions[j].studentId,
          similarity,
          riskLevel
        });
      }
    }
  }
  
  return plagiarismCases.sort((a, b) => b.similarity - a.similarity);
}
