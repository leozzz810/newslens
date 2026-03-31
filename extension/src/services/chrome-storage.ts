import type { PersistStorage, StorageValue } from 'zustand/middleware';

export const chromeStorage = <T>(): PersistStorage<T> => ({
  getItem: (key: string): Promise<StorageValue<T> | null> =>
    new Promise((resolve, reject) =>
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const value = result[key];
          if (value === undefined || value === null) {
            resolve(null);
          } else if (typeof value === 'string') {
            try {
              resolve(JSON.parse(value) as StorageValue<T>);
            } catch {
              resolve(null);
            }
          } else if (typeof value === 'object' && 'state' in value) {
            // 舊版 chrome-storage 直接存 StorageValue 物件（未 JSON.stringify）
            resolve(value as StorageValue<T>);
          } else {
            // 未知格式（例如 service worker 存的原始 API 回應），捨棄
            resolve(null);
          }
        }
      })
    ),
  setItem: (key: string, value: StorageValue<T>): Promise<void> =>
    new Promise((resolve, reject) =>
      chrome.storage.local.set({ [key]: JSON.stringify(value) }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      })
    ),
  removeItem: (key: string): Promise<void> =>
    new Promise((resolve, reject) =>
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      })
    ),
});

export async function getStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve((result[key] as T | undefined) ?? null);
      }
    })
  );
}

export async function setStorage(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    })
  );
}