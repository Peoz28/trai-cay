
export interface FruitAnalysis {
  fruitName: string;
  condition: 'chín' | 'xanh' | 'tươi' | 'hỏng' | 'tốt' | 'xấu' | 'không xác định';
  confidence: number;
  description: string;
  ripenessScore: number;
}
