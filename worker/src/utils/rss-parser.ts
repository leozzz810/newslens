import { XMLParser } from 'fast-xml-parser';

export interface ParsedItem {
  title: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  description?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
  cdataPropName: '__cdata',
});

function safeImageUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch {
    // 非合法 URL
  }
  return undefined;
}

function extractImage(item: Record<string, unknown>): string | undefined {
  // media:content — 可能是物件或陣列，取第一個有效 URL
  const mc = item['media:content'];
  const mediaContent = Array.isArray(mc)
    ? (mc[0] as Record<string, string> | undefined)
    : (mc as Record<string, string> | undefined);
  const mcUrl = safeImageUrl(mediaContent?.['@_url']);
  if (mcUrl) return mcUrl;

  // media:thumbnail
  const mediaThumbnail = item['media:thumbnail'] as Record<string, string> | undefined;
  const mtUrl = safeImageUrl(mediaThumbnail?.['@_url']);
  if (mtUrl) return mtUrl;

  // enclosure
  const enclosure = item['enclosure'] as Record<string, string> | undefined;
  if (enclosure?.['@_type']?.startsWith('image/')) {
    const encUrl = safeImageUrl(enclosure['@_url']);
    if (encUrl) return encUrl;
  }

  // 從 description 中找 <img> 標籤
  const desc = (item['description'] as string) ?? (item['content:encoded'] as string) ?? '';
  const imgMatch = /<img[^>]+src="([^"]+)"/i.exec(desc);
  if (imgMatch?.[1]) return safeImageUrl(imgMatch[1]);

  return undefined;
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if ('__cdata' in obj) return String(obj['__cdata']);
    if ('#text' in obj) return String(obj['#text']);
  }
  return '';
}

function normalizeDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  const str = String(value);
  const date = new Date(str);
  if (isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

export function parseRss(xml: string): ParsedItem[] {
  try {
    const parsed = parser.parse(xml) as Record<string, unknown>;

    // RSS 2.0
    const rss = parsed['rss'] as Record<string, unknown> | undefined;
    if (rss) {
      const channel = rss['channel'] as Record<string, unknown>;
      const items = channel['item'] as Record<string, unknown>[];
      if (!Array.isArray(items)) return [];
      return items.map((item) => ({
        title: extractText(item['title']),
        url: extractText(item['link']),
        publishedAt: normalizeDate(item['pubDate'] ?? item['dc:date']),
        imageUrl: extractImage(item),
        description: extractText(item['description']),
      })).filter((i) => i.title && i.url);
    }

    // Atom
    const feed = parsed['feed'] as Record<string, unknown> | undefined;
    if (feed) {
      const entries = feed['entry'] as Record<string, unknown>[];
      if (!Array.isArray(entries)) return [];
      return entries.map((entry) => {
        const linkVal = entry['link'];
        let url = '';
        if (typeof linkVal === 'string') {
          url = linkVal;
        } else if (Array.isArray(linkVal)) {
          const alt = (linkVal as Record<string, string>[]).find((l) => l['@_rel'] !== 'self');
          url = alt?.['@_href'] ?? (linkVal[0] as Record<string, string>)?.['@_href'] ?? '';
        } else if (typeof linkVal === 'object' && linkVal !== null) {
          url = (linkVal as Record<string, string>)['@_href'] ?? '';
        }
        return {
          title: extractText(entry['title']),
          url,
          publishedAt: normalizeDate(entry['published'] ?? entry['updated']),
          imageUrl: extractImage(entry),
          description: extractText(entry['summary'] ?? entry['content']),
        };
      }).filter((i) => i.title && i.url);
    }

    return [];
  } catch {
    return [];
  }
}
