export class SimilarityService {
  calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    // Normalize texts
    const normalizedText1 = this.normalizeText(text1);
    const normalizedText2 = this.normalizeText(text2);
    
    // Simple word-based similarity
    const words1 = normalizedText1.split(' ');
    const words2 = normalizedText2.split(' ');
    
    // Calculate Jaccard similarity
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Advanced similarity calculation using cosine similarity
  calculateCosineSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const words1 = this.normalizeText(text1).split(' ');
    const words2 = this.normalizeText(text2).split(' ');

    // Create vocabulary
    const vocabulary = Array.from(new Set([...words1, ...words2]));

    // Create vectors
    const vector1 = vocabulary.map(word => words1.filter(w => w === word).length);
    const vector2 = vocabulary.map(word => words2.filter(w => w === word).length);

    // Calculate cosine similarity
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }
}