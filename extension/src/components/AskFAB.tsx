import React, { useState, useRef, useEffect } from 'react';
import { useQAStore } from '../stores/qaStore.js';
import { formatRelativeTime } from '../utils/time.js';

export default function AskFAB() {
  const { history, isAsking, error, isOpen, toggleOpen, ask, clearHistory } = useQAStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新訊息時捲到底
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isAsking) return;
    setInput('');
    await ask(q);
  };

  return (
    <>
      {/* 展開的對話面板 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 h-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* 標題 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">AI 新聞問答</span>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  清除
                </button>
              )}
              <button onClick={toggleOpen} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                ✕
              </button>
            </div>
          </div>

          {/* 對話紀錄 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && !isAsking && (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  針對今日新聞提問，例如：<br />
                  「台積電今天為什麼漲？」
                </p>
              </div>
            )}

            {[...history].reverse().map((item) => (
              <div key={item.id} className="space-y-2">
                {/* 問題 */}
                <div className="flex justify-end">
                  <div className="bg-brand-600 text-white text-sm rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                    {item.question}
                  </div>
                </div>
                {/* 回答 */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                    <p className="leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    {item.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                        {item.sources.slice(0, 3).map((src) => (
                          <a
                            key={src.id}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-brand-600 dark:text-brand-400 hover:underline line-clamp-1"
                          >
                            📰 {src.title}
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(item.askedAt)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* 問答中 */}
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-center text-red-500">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 輸入框 */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="針對今日新聞提問..."
              className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
              disabled={isAsking}
            />
            <button
              type="submit"
              disabled={isAsking || !input.trim()}
              className="px-3 py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              送出
            </button>
          </form>
        </div>
      )}

      {/* FAB 按鈕 */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-all ${
          isOpen
            ? 'bg-gray-600 text-white rotate-90'
            : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
        }`}
        aria-label="AI 問答"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
}
