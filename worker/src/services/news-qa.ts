import type { NewsItem, AskResponse } from '@newslens/shared';

const QA_PROMPT = `你是一個新聞助理。根據以下近期新聞內容，回答使用者的問題。

規則：
1. 只根據提供的新聞內容回答，不要加入其他知識
2. 若新聞中找不到相關資訊，明確說「根據目前新聞，尚無相關資訊」
3. 回答使用繁體中文，簡潔清楚，100-200 字
4. 最後列出引用的新聞標題（用 [來源] 標記）`;

// 從問題中提取關鍵字（移除常見停用詞）
const STOP_WORDS = new Set(['的', '是', '在', '了', '嗎', '呢', '為什麼', '什麼', '如何', '怎麼', '有', '沒有', '請問', '最新', '今天', '昨天']);

export function extractKeywords(question: string): string[] {
  return question
    .replace(/[？?！!。，,、]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
    .slice(0, 5);
}

export async function answerQuestion(
  question: string,
  context: NewsItem[],
  apiKey: string
): Promise<AskResponse> {
  const generatedAt = new Date().toISOString();

  if (!apiKey) {
    return {
      answer: '目前問答功能需要 API Key，請聯繫管理員。',
      sources: [],
      generatedAt,
    };
  }

  if (context.length === 0) {
    return {
      answer: '根據目前新聞，尚無與此問題相關的資訊。',
      sources: [],
      generatedAt,
    };
  }

  // 限制 context 大小，避免超過 token 限制
  const contextText = context
    .slice(0, 8)
    .map((item, i) => `[${i + 1}] ${item.title}\n${item.summary}`)
    .join('\n\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${QA_PROMPT}\n\n近期新聞：\n${contextText}\n\n使用者問題：${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const answer = data.content[0]?.text ?? '無法取得回答';

  const sources = context.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
  }));

  return { answer, sources, generatedAt };
}
