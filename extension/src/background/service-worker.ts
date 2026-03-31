import { API_BASE_URL } from '../utils/constants.js';

const ALARM_NAME = 'refresh-news';
const REFRESH_INTERVAL_MINUTES = 15;

// 安裝時立即觸發一次，並建立定時 alarm
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 0.1,
    periodInMinutes: REFRESH_INTERVAL_MINUTES,
  });
});

// 定時觸發更新
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await warmupCache();
  }
});

// 只預熱 Cloudflare Worker 快取，不直接寫入 chrome.storage
// （chrome.storage 由各 Zustand store 的 persist middleware 管理）
async function warmupCache(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/v1/news?limit=40`);
  } catch {
    // 網路失敗靜默處理
  }
}

// 讓 Service Worker 保持活躍（MV3 限制）
self.addEventListener('activate', () => {
  // intentionally empty — alarms will keep the worker alive when needed
});
