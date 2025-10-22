/**
 * Advanced NLP Analysis Service for Educational Content
 * Uses multiple algorithms for comprehensive answer evaluation
 */

import * as natural from 'natural';
import compromise from 'compromise';
import Sentiment from 'sentiment';
import keywordExtractor from 'keyword-extractor';

interface TermFrequency {
  [key: string]: number;
}

interface AnalysisResult {
  overallSimilarity: number;
  cosineSimilarity: number;
  semanticSimilarity: number;
  keywordMatch: number;
  sentimentMatch: number;
  contextualAccuracy: number;
  detailedBreakdown: {
    matchedKeywords: string[];
    missedKeywords: string[];
    sentiment: {
      reference: any;
      student: any;
    };
    entities: {
      reference: any[];
      student: any[];
      matched: any[];
    };
    readabilityScore: number;
    confidenceScore: number;
  };
}

// Initialize sentiment analyzer
const sentiment = new Sentiment();

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out very short words
}

function getTermFrequency(tokens: string[]): TermFrequency {
  const tf: TermFrequency = {};
  const totalTokens = tokens.length;
  
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  
  // Normalize by total tokens
  for (const term in tf) {
    tf[term] = tf[term] / totalTokens;
  }
  
  return tf;
}

function getInverseDocumentFrequency(documents: string[][]): TermFrequency {
  const idf: TermFrequency = {};
  const totalDocs = documents.length;
  
  // Get all unique terms
  const allTerms = new Set<string>();
  for (const doc of documents) {
    for (const term of doc) {
      allTerms.add(term);
    }
  }
  
  // Calculate IDF for each term
  allTerms.forEach(term => {
    const docsWithTerm = documents.filter(doc => doc.includes(term)).length;
    idf[term] = Math.log(totalDocs / (1 + docsWithTerm));
  });
  
  return idf;
}

function getTfIdfVector(tf: TermFrequency, idf: TermFrequency): TermFrequency {
  const tfidf: TermFrequency = {};
  
  for (const term in tf) {
    tfidf[term] = tf[term] * (idf[term] || 0);
  }
  
  return tfidf;
}

function cosineSimilarity(vectorA: TermFrequency, vectorB: TermFrequency): number {
  const termsA = Object.keys(vectorA);
  const termsB = Object.keys(vectorB);
  const allTerms = Array.from(new Set([...termsA, ...termsB]));
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  allTerms.forEach(term => {
    const a = vectorA[term] || 0;
    const b = vectorB[term] || 0;
    
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// Advanced keyword extraction and preprocessing
function extractKeywords(text: string): string[] {
  try {
    const extractionResult = keywordExtractor.extract(text, {
      language: 'english',
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });
    
    return extractionResult && extractionResult.length > 0 ? extractionResult : tokenize(text);
  } catch (error) {
    // Fallback to simple tokenization if keyword extraction fails
    return tokenize(text);
  }
}

// Semantic similarity using compromise for NLP processing
function calculateSemanticSimilarity(text1: string, text2: string): number {
  const doc1 = compromise(text1);
  const doc2 = compromise(text2);
  
  // Extract entities (nouns, verbs, adjectives)
  const entities1 = {
    nouns: doc1.nouns().out('array'),
    verbs: doc1.verbs().out('array'),
    adjectives: doc1.adjectives().out('array')
  };
  
  const entities2 = {
    nouns: doc2.nouns().out('array'),
    verbs: doc2.verbs().out('array'),
    adjectives: doc2.adjectives().out('array')
  };
  
  // Calculate semantic overlap
  let totalMatches = 0;
  let totalEntities = 0;
  
  Object.keys(entities1).forEach(type => {
    const set1 = new Set(entities1[type as keyof typeof entities1].map((e: any) => e.toLowerCase()));
    const set2 = new Set(entities2[type as keyof typeof entities2].map((e: any) => e.toLowerCase()));
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    if (union.size > 0) {
      totalMatches += intersection.size;
      totalEntities += union.size;
    }
  });
  
  return totalEntities > 0 ? totalMatches / totalEntities : 0;
}

// Advanced keyword matching with weights
function calculateKeywordMatch(referenceText: string, studentText: string): {
  score: number;
  matched: string[];
  missed: string[];
} {
  const referenceKeywords = extractKeywords(referenceText);
  const studentKeywords = extractKeywords(studentText);
  
  const refSet = new Set(referenceKeywords.map(k => k.toLowerCase()));
  const stuSet = new Set(studentKeywords.map(k => k.toLowerCase()));
  
  const matched = Array.from(refSet).filter(k => stuSet.has(k));
  const missed = Array.from(refSet).filter(k => !stuSet.has(k));
  
  const score = refSet.size > 0 ? matched.length / refSet.size : 0;
  
  return { score, matched, missed };
}

// Context analysis using entity recognition
function analyzeContext(text1: string, text2: string): {
  similarity: number;
  entities: {
    reference: any[];
    student: any[];
    matched: any[];
  };
} {
  const doc1 = compromise(text1);
  const doc2 = compromise(text2);
  
  const entities1 = doc1.topics().out('array');
  const entities2 = doc2.topics().out('array');
  
  const ent1Set = new Set(entities1.map((e: string) => e.toLowerCase()));
  const ent2Set = new Set(entities2.map((e: string) => e.toLowerCase()));
  
  const matched = Array.from(ent1Set).filter(e => ent2Set.has(e));
  const totalUnique = new Set([...Array.from(ent1Set), ...Array.from(ent2Set)]).size;
  
  const similarity = totalUnique > 0 ? matched.length / totalUnique : 0;
  
  return {
    similarity,
    entities: {
      reference: entities1,
      student: entities2,
      matched
    }
  };
}

// Enhanced analysis function
export function analyzeAnswer(referenceAnswer: string, studentAnswer: string): AnalysisResult {
  if (!referenceAnswer || !studentAnswer) {
    return createEmptyResult();
  }
  
  // Handle exact matches
  if (referenceAnswer.toLowerCase().trim() === studentAnswer.toLowerCase().trim()) {
    return createPerfectResult(referenceAnswer, studentAnswer);
  }
  
  // Calculate various similarity metrics
  const cosineSimilarity = calculateBasicCosineSimilarity(referenceAnswer, studentAnswer);
  const semanticSimilarity = calculateSemanticSimilarity(referenceAnswer, studentAnswer);
  const keywordAnalysis = calculateKeywordMatch(referenceAnswer, studentAnswer);
  const contextAnalysis = analyzeContext(referenceAnswer, studentAnswer);
  
  // Sentiment analysis
  const refSentiment = sentiment.analyze(referenceAnswer);
  const stuSentiment = sentiment.analyze(studentAnswer);
  const sentimentMatch = calculateSentimentSimilarity(refSentiment, stuSentiment);
  
  // Calculate readability (complexity measure)
  const readabilityScore = calculateReadabilityScore(studentAnswer);
  
  // Weighted overall similarity
  const weights = {
    cosine: 0.3,
    semantic: 0.25,
    keyword: 0.25,
    context: 0.15,
    sentiment: 0.05
  };
  
  const overallSimilarity = 
    cosineSimilarity * weights.cosine +
    semanticSimilarity * weights.semantic +
    keywordAnalysis.score * weights.keyword +
    contextAnalysis.similarity * weights.context +
    sentimentMatch * weights.sentiment;
  
  // Calculate confidence score based on answer length and complexity
  const confidenceScore = calculateConfidenceScore(studentAnswer, overallSimilarity);
  
  return {
    overallSimilarity: Math.max(0, Math.min(1, overallSimilarity)),
    cosineSimilarity,
    semanticSimilarity,
    keywordMatch: keywordAnalysis.score,
    sentimentMatch,
    contextualAccuracy: contextAnalysis.similarity,
    detailedBreakdown: {
      matchedKeywords: keywordAnalysis.matched,
      missedKeywords: keywordAnalysis.missed,
      sentiment: {
        reference: refSentiment,
        student: stuSentiment
      },
      entities: contextAnalysis.entities,
      readabilityScore,
      confidenceScore
    }
  };
}

function calculateBasicCosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0;
  }
  
  const documents = [tokens1, tokens2];
  const tf1 = getTermFrequency(tokens1);
  const tf2 = getTermFrequency(tokens2);
  const idf = getInverseDocumentFrequency(documents);
  
  const tfidf1 = getTfIdfVector(tf1, idf);
  const tfidf2 = getTfIdfVector(tf2, idf);
  
  return cosineSimilarity(tfidf1, tfidf2);
}

function calculateSentimentSimilarity(sentiment1: any, sentiment2: any): number {
  const score1 = sentiment1.score;
  const score2 = sentiment2.score;
  
  // Normalize sentiment scores to 0-1 range
  const normalizedScore1 = (score1 + 5) / 10; // Assuming sentiment range is -5 to 5
  const normalizedScore2 = (score2 + 5) / 10;
  
  return 1 - Math.abs(normalizedScore1 - normalizedScore2);
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = tokenize(text);
  const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  // Flesch Reading Ease approximation
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, fleschScore / 100));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateConfidenceScore(studentAnswer: string, similarity: number): number {
  const wordCount = tokenize(studentAnswer).length;
  const lengthFactor = Math.min(1, wordCount / 20); // Normalize for ~20 words as optimal
  const similarityFactor = similarity;
  
  return (lengthFactor * 0.3 + similarityFactor * 0.7);
}

function createEmptyResult(): AnalysisResult {
  return {
    overallSimilarity: 0,
    cosineSimilarity: 0,
    semanticSimilarity: 0,
    keywordMatch: 0,
    sentimentMatch: 0,
    contextualAccuracy: 0,
    detailedBreakdown: {
      matchedKeywords: [],
      missedKeywords: [],
      sentiment: { reference: null, student: null },
      entities: { reference: [], student: [], matched: [] },
      readabilityScore: 0,
      confidenceScore: 0
    }
  };
}

function createPerfectResult(referenceAnswer: string, studentAnswer: string): AnalysisResult {
  const refSentiment = sentiment.analyze(referenceAnswer);
  const stuSentiment = sentiment.analyze(studentAnswer);
  const keywords = extractKeywords(referenceAnswer);
  
  return {
    overallSimilarity: 1,
    cosineSimilarity: 1,
    semanticSimilarity: 1,
    keywordMatch: 1,
    sentimentMatch: 1,
    contextualAccuracy: 1,
    detailedBreakdown: {
      matchedKeywords: keywords,
      missedKeywords: [],
      sentiment: { reference: refSentiment, student: stuSentiment },
      entities: { reference: [], student: [], matched: [] },
      readabilityScore: calculateReadabilityScore(studentAnswer),
      confidenceScore: 1
    }
  };
}

// Legacy function for backward compatibility
export function calculateSimilarity(text1: string, text2: string): number {
  const analysis = analyzeAnswer(text1, text2);
  return analysis.overallSimilarity;
}

export function calculateScore(similarity: number, maxPoints: number = 10): number {
  // Enhanced scoring with more granular thresholds
  if (similarity >= 0.95) return maxPoints;
  if (similarity >= 0.9) return Math.round(maxPoints * 0.95);
  if (similarity >= 0.85) return Math.round(maxPoints * 0.9);
  if (similarity >= 0.8) return Math.round(maxPoints * 0.85);
  if (similarity >= 0.75) return Math.round(maxPoints * 0.8);
  if (similarity >= 0.7) return Math.round(maxPoints * 0.75);
  if (similarity >= 0.65) return Math.round(maxPoints * 0.7);
  if (similarity >= 0.6) return Math.round(maxPoints * 0.65);
  if (similarity >= 0.55) return Math.round(maxPoints * 0.6);
  if (similarity >= 0.5) return Math.round(maxPoints * 0.55);
  if (similarity >= 0.45) return Math.round(maxPoints * 0.5);
  if (similarity >= 0.4) return Math.round(maxPoints * 0.4);
  if (similarity >= 0.35) return Math.round(maxPoints * 0.3);
  if (similarity >= 0.3) return Math.round(maxPoints * 0.2);
  if (similarity >= 0.25) return Math.round(maxPoints * 0.1);
  return 0;
}