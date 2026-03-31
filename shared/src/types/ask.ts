export interface AskRequest {
  question: string;
}

export interface AskSource {
  id: string;
  title: string;
  url: string;
}

export interface AskResponse {
  answer: string;
  sources: AskSource[];
  generatedAt: string;
}

export interface QAHistoryItem {
  id: string;
  question: string;
  answer: string;
  sources: AskSource[];
  askedAt: string;
}
