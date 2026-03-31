export interface DailyBriefing {
  id: string;
  date: string;
  headline: string;
  content: string;
  keyTopics: string[];
  generatedAt: string;
}

export interface BriefingResponse {
  briefing: DailyBriefing | null;
}
