import { z } from 'zod';
import type { NewsItem } from '@newslens/shared';
import { AI_BATCH_SIZE, NEWS_PROCESSING_PROMPT } from '../config.js';

const AiResultSchema = z.array(
  z.object({
    id: z.string(),
    summary: z.string(),
    category: z.enum([
      'technology', 'business', 'world', 'politics',
      'science', 'entertainment', 'sports', 'health', 'lifestyle',
    ]),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    aiScore: z.number().min(1).max(100),
    tags: z.array(z.string()).max(3),
  })
);

interface Env {
  ANTHROPIC_API_KEY: string;
}

async function callClaude(
  apiKey: string,
  items: NewsItem[]
): Promise<z.infer<typeof AiResultSchema>> {
  const inputData = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.summary || '',
  }));

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
          content: `${NEWS_PROCESSING_PROMPT}\n\n新聞列表：\n${JSON.stringify(inputData, null, 2)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content[0]?.text ?? '';

  // 找出 JSON 陣列
  const jsonMatch = /\[[\s\S]*\]/.exec(text);
  if (!jsonMatch) throw new Error('AI 回傳格式錯誤');

  const parsed = JSON.parse(jsonMatch[0]) as unknown;
  return AiResultSchema.parse(parsed);
}

export async function processNewsWithAI(
  items: NewsItem[],
  env: Env
): Promise<NewsItem[]> {
  if (!env.ANTHROPIC_API_KEY) {
    // 無 API Key 時，直接回傳原始資料（開發用）
    return items;
  }

  const results: NewsItem[] = [];

  // 批次處理
  for (let i = 0; i < items.length; i += AI_BATCH_SIZE) {
    const batch = items.slice(i, i + AI_BATCH_SIZE);

    try {
      const aiResults = await callClaude(env.ANTHROPIC_API_KEY, batch);

      // 合併 AI 結果回原始 items
      const aiMap = new Map(aiResults.map((r) => [r.id, r]));
      for (const item of batch) {
        const aiData = aiMap.get(item.id);
        if (aiData) {
          results.push({
            ...item,
            summary: aiData.summary,
            category: aiData.category,
            sentiment: aiData.sentiment,
            aiScore: aiData.aiScore,
            tags: aiData.tags,
          });
        } else {
          results.push(item);
        }
      }
    } catch (err) {
      console.error(`AI pipeline error (batch ${i / AI_BATCH_SIZE + 1}):`, err);
      results.push(...batch);
    }
  }

  return results;
}
