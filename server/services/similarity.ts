/**
 * Calculate cosine similarity between two text strings
 * Uses TF-IDF vectorization for better accuracy
 */

interface TermFrequency {
  [key: string]: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
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

export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) {
    return 0;
  }
  
  // Handle exact matches
  if (text1.toLowerCase().trim() === text2.toLowerCase().trim()) {
    return 1;
  }
  
  // Tokenize both texts
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0;
  }
  
  // Simple similarity for very short texts
  if (tokens1.length < 3 && tokens2.length < 3) {
    const intersection = tokens1.filter(token => tokens2.includes(token));
    const union = new Set([...tokens1, ...tokens2]);
    return intersection.length / union.size;
  }
  
  // Use TF-IDF for longer texts
  const documents = [tokens1, tokens2];
  const tf1 = getTermFrequency(tokens1);
  const tf2 = getTermFrequency(tokens2);
  const idf = getInverseDocumentFrequency(documents);
  
  const tfidf1 = getTfIdfVector(tf1, idf);
  const tfidf2 = getTfIdfVector(tf2, idf);
  
  const similarity = cosineSimilarity(tfidf1, tfidf2);
  
  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, similarity));
}

export function calculateScore(similarity: number, maxPoints: number = 10): number {
  // Score based on similarity with different thresholds
  if (similarity >= 0.9) return maxPoints;
  if (similarity >= 0.8) return Math.round(maxPoints * 0.9);
  if (similarity >= 0.7) return Math.round(maxPoints * 0.8);
  if (similarity >= 0.6) return Math.round(maxPoints * 0.7);
  if (similarity >= 0.5) return Math.round(maxPoints * 0.6);
  if (similarity >= 0.4) return Math.round(maxPoints * 0.4);
  if (similarity >= 0.3) return Math.round(maxPoints * 0.2);
  return 0;
}