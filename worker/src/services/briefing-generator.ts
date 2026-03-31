import { z } from 'zod';
import type { NewsItem, DailyBriefing } from '@newslens/shared';

const BriefingResultSchema = z.object({
  headline: z.string(),
  content: z.string(),
  keyTopics: z.array(z.string()).max(5),
});

const BRIEFING_PROMPT = `你是一個專業的新聞主編。根據以下今日重要新聞，產出一份簡短的每日新聞簡報。

請回傳 JSON 格式：
{
  "headline": "一句話總結今日最重要的新聞（20字以內）",
  "content": "Markdown 格式的簡報，3-4 個段落，每段以「## 主題」開頭，列出 2-3 則相關新聞重點（用繁體中文）",
  "keyTopics": ["今日關鍵詞1", "關鍵詞2", "關鍵詞3"]
}

規則：
1. 全部使用繁體中文
2. 客觀中立，不帶個人意見
3. 回傳純 JSON，不要有其他文字`;

export async function generateDailyBriefing(
  newsItems: NewsItem[],
  apiKey: string
): Promise<Omit<DailyBriefing, 'id'>> {
  const today = new Date().toISOString().slice(0, 10);

  if (!apiKey || newsItems.length === 0) {
    return {
      date: today,
      headline: '今日新聞簡報',
      content: '## 今日新聞\n\n目前尚無新聞資料。',
      keyTopics: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const context = newsItems
    .slice(0, 20)
    .map((item, i) => `${i + 1}. [${item.category}] ${item.title}\n   ${item.summary}`)
    .join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${BRIEFING_PROMPT}\n\n今日新聞列表：\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const text = data.content[0]?.text ?? '';
  const jsonMatch = /\{[\s\S]*\}/.exec(text);

  if (!jsonMatch) {
    throw new Error('簡報生成格式錯誤');
  }

  const parsed = BriefingResultSchema.parse(JSON.parse(jsonMatch[0]));

  return {
    date: today,
    headline: parsed.headline,
    content: parsed.content,
    keyTopics: parsed.keyTopics,
    generatedAt: new Date().toISOString(),
  };
}
