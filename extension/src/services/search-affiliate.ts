import type { SearchEngine } from '@newslens/shared';

// 申請後替換成正式 partner code
const YAHOO_HSPART = import.meta.env.VITE_YAHOO_HSPART ?? 'newslens';
const YAHOO_HSIMP = import.meta.env.VITE_YAHOO_HSIMP ?? 'yhs-001';
const BING_PC = import.meta.env.VITE_BING_PC ?? 'NEWSLENS';
const BING_FORM = import.meta.env.VITE_BING_FORM ?? 'NEWSLNS';

export function buildSearchUrl(query: string, engine: SearchEngine): string {
  const encoded = encodeURIComponent(query);
  if (engine === 'yahoo') {
    return `https://search.yahoo.com/search?p=${encoded}&hspart=${YAHOO_HSPART}&hsimp=${YAHOO_HSIMP}`;
  }
  return `https://www.bing.com/search?q=${encoded}&PC=${BING_PC}&FORM=${BING_FORM}`;
}

export function buildSuggestUrl(query: string, engine: SearchEngine): string {
  const encoded = encodeURIComponent(query);
  if (engine === 'yahoo') {
    return `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&nresults=6&command=${encoded}`;
  }
  return `https://api.bing.com/osjson.aspx?query=${encoded}`;
}
