import * as natural from 'natural';
import nlp from 'compromise';

export class SimilarityService {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'
  ]);

  /**
   * Advanced NLP-based similarity calculation using multiple techniques
   * This combines semantic analysis, stemming, and weighted scoring for better accuracy
   */
  calculateSimilarity(studentAnswer: string, correctAnswer: string): number {
    if (!studentAnswer || !correctAnswer) return 0;
    
    // Normalize and process both texts
    const processedStudent = this.processText(studentAnswer);
    const processedCorrect = this.processText(correctAnswer);
    
    // Calculate multiple similarity metrics
    const semanticScore = this.calculateSemanticSimilarity(studentAnswer, correctAnswer);
    const stemmedScore = this.calculateStemmedSimilarity(processedStudent, processedCorrect);
    const keywordScore = this.calculateKeywordSimilarity(processedStudent, processedCorrect);
    const structuralScore = this.calculateStructuralSimilarity(studentAnswer, correctAnswer);
    
    // Weighted combination for final score with more stringent requirements
    const finalScore = (
      semanticScore * 0.4 +      // 40% weight for semantic understanding
      stemmedScore * 0.3 +       // 30% weight for stemmed word matching
      keywordScore * 0.2 +       // 20% weight for keyword presence
      structuralScore * 0.1      // 10% weight for structural similarity
    );
    
    // Apply more stringent scoring - require higher threshold for high scores
    let adjustedScore = finalScore;
    if (finalScore > 0.8) {
      // For scores above 80%, require even stronger match
      adjustedScore = finalScore * 0.85;
    } else if (finalScore > 0.6) {
      // For scores above 60%, apply moderate penalty
      adjustedScore = finalScore * 0.9;
    }
    
    return Math.min(adjustedScore, 1.0); // Cap at 100%
  }

  private processText(text: string): string[] {
    // Clean and normalize text
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(cleaned) || [];
    
    // Remove stop words and apply stemming
    return tokens
      .filter(token => !this.stopWords.has(token) && token.length > 2)
      .map(token => this.stemmer.stem(token));
  }

  private calculateSemanticSimilarity(text1: string, text2: string): number {
    try {
      // Use compromise for semantic analysis
      const doc1 = nlp(text1);
      const doc2 = nlp(text2);
      
      // Extract important entities and concepts
      const entities1 = new Set([
        ...doc1.people().out('array'),
        ...doc1.places().out('array'),
        ...doc1.organizations().out('array'),
        ...doc1.nouns().out('array'),
        ...doc1.verbs().out('array')
      ]);
      
      const entities2 = new Set([
        ...doc2.people().out('array'),
        ...doc2.places().out('array'),
        ...doc2.organizations().out('array'),
        ...doc2.nouns().out('array'),
        ...doc2.verbs().out('array')
      ]);
      
      if (entities1.size === 0 && entities2.size === 0) return 0;
      
      // Calculate overlap of important entities
      const entities1Array = Array.from(entities1);
      const entities2Array = Array.from(entities2);
      const intersection = new Set(entities1Array.filter(x => entities2.has(x)));
      const union = new Set([...entities1Array, ...entities2Array]);
      
      return intersection.size / union.size;
    } catch (error) {
      console.warn('Semantic analysis failed, falling back to basic similarity');
      return this.calculateBasicSimilarity(text1, text2);
    }
  }

  private calculateStemmedSimilarity(tokens1: string[], tokens2: string[]): number {
    if (tokens1.length === 0 && tokens2.length === 0) return 1;
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const set1Array = Array.from(set1);
    const set2Array = Array.from(set2);
    const intersection = new Set(set1Array.filter(x => set2.has(x)));
    const union = new Set([...set1Array, ...set2Array]);
    
    return intersection.size / union.size;
  }

  private calculateKeywordSimilarity(tokens1: string[], tokens2: string[]): number {
    // Weight important keywords more heavily
    const importantTokens1 = tokens1.filter(token => token.length > 4);
    const importantTokens2 = tokens2.filter(token => token.length > 4);
    
    if (importantTokens1.length === 0 && importantTokens2.length === 0) return 1;
    if (importantTokens1.length === 0 || importantTokens2.length === 0) return 0;
    
    const set1 = new Set(importantTokens1);
    const set2 = new Set(importantTokens2);
    
    const set1Array = Array.from(set1);
    const intersection = new Set(set1Array.filter(x => set2.has(x)));
    
    return intersection.size / Math.max(set1.size, set2.size);
  }

  private calculateStructuralSimilarity(text1: string, text2: string): number {
    // Compare text structure (length, sentence count, etc.)
    const sentences1 = text1.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentences2 = text2.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const lengthRatio = Math.min(text1.length, text2.length) / Math.max(text1.length, text2.length);
    const sentenceRatio = Math.min(sentences1.length, sentences2.length) / Math.max(sentences1.length, sentences2.length);
    
    return (lengthRatio + sentenceRatio) / 2;
  }

  private calculateBasicSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const set1Array = Array.from(set1);
    const set2Array = Array.from(set2);
    const intersection = new Set(set1Array.filter(x => set2.has(x)));
    const union = new Set([...set1Array, ...set2Array]);
    
    return intersection.size / union.size;
  }

  /**
   * Legacy method for backward compatibility
   */
  calculateCosineSimilarity(text1: string, text2: string): number {
    return this.calculateSimilarity(text1, text2);
  }
}