import type { KVNamespace } from '@cloudflare/workers-types';

const KV_TTL_SECONDS = 300; // 5 分鐘

export async function getFromCache<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const value = await kv.get(key, 'json');
  return value as T | null;
}

export async function setToCache(
  kv: KVNamespace,
  key: string,
  value: unknown,
  ttl = KV_TTL_SECONDS
): Promise<void> {
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
}

export function buildCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:v1:${parts.join(':')}`;
}
