export interface TrendingTopic {
  keyword: string;
  count: number;
  category: string;
  sampleNewsIds: string[];
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  generatedAt: string;
}
