import type { RssSource } from '@newslens/shared';

export const RSS_SOURCES: RssSource[] = [
  // 繁體中文科技
  {
    id: 'technews',
    name: 'TechNews 科技新報',
    url: 'https://technews.tw/feed/',
    category: 'technology',
    language: 'zh-TW',
    enabled: true,
  },
  {
    id: 'ithome',
    name: 'iThome',
    url: 'https://www.ithome.com.tw/rss',
    category: 'technology',
    language: 'zh-TW',
    enabled: true,
  },
  {
    id: 'inside',
    name: 'Inside 硬塞的網路趨勢觀察',
    url: 'https://www.inside.com.tw/feed',
    category: 'technology',
    language: 'zh-TW',
    enabled: true,
  },
  // 繁體中文財經
  {
    id: 'money_udn',
    name: '經濟日報',
    url: 'https://money.udn.com/rssfeed/news/1001/USD',
    category: 'business',
    language: 'zh-TW',
    enabled: true,
  },
  // 繁體中文國際
  {
    id: 'cna',
    name: '中央社',
    url: 'https://www.cna.com.tw/rss/aall.aspx',
    category: 'world',
    language: 'zh-TW',
    enabled: true,
  },
  // 英文科技
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology',
    language: 'en',
    enabled: true,
  },
  {
    id: 'ars_technica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
    language: 'en',
    enabled: true,
  },
  // 英文國際
  {
    id: 'bbc_world',
    name: 'BBC News World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world',
    language: 'en',
    enabled: true,
  },
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'world',
    language: 'en',
    enabled: true,
  },
  // 英文財經
  {
    id: 'wsj_markets',
    name: 'WSJ Markets',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_marketpulse',
    category: 'business',
    language: 'en',
    enabled: true,
  },
  // Hacker News
  {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'technology',
    language: 'en',
    enabled: true,
  },
  // 繁體中文生活
  {
    id: 'womany',
    name: '女人迷 Womany',
    url: 'https://womany.net/feed',
    category: 'lifestyle',
    language: 'zh-TW',
    enabled: true,
  },
  {
    id: 'ettoday_life',
    name: 'ETtoday 生活',
    url: 'https://www.ettoday.net/news/rss/9.xml',
    category: 'lifestyle',
    language: 'zh-TW',
    enabled: true,
  },
  {
    id: 'setn_life',
    name: '三立新聞 生活',
    url: 'https://www.setn.com/rss.aspx?PageGroupID=5',
    category: 'lifestyle',
    language: 'zh-TW',
    enabled: true,
  },
  // 英文生活
  {
    id: 'lifehacker',
    name: 'Lifehacker',
    url: 'https://lifehacker.com/rss',
    category: 'lifestyle',
    language: 'en',
    enabled: true,
  },
  {
    id: 'guardian_life',
    name: 'The Guardian Life',
    url: 'https://www.theguardian.com/lifeandstyle/rss',
    category: 'lifestyle',
    language: 'en',
    enabled: true,
  },
];

export const AI_BATCH_SIZE = 10;

export const NEWS_PROCESSING_PROMPT = `你是一個新聞編輯 AI。針對以下新聞文章，請回傳 JSON 陣列，每筆包含：

{
  "id": "原始 id",
  "summary": "2-3 句繁體中文摘要，保持客觀中立",
  "category": "technology|business|world|politics|science|entertainment|sports|health|lifestyle",
  "sentiment": "positive|neutral|negative",
  "aiScore": 1-100,
  "tags": ["標籤1", "標籤2"]
}

規則：
1. 摘要必須客觀，不帶個人意見，用繁體中文
2. aiScore：100=重大突發新聞，50=一般重要性，1=瑣碎資訊
3. 標籤最多 3 個，使用繁體中文
4. 回傳純 JSON 陣列，不要有任何其他文字`;
