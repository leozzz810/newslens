import React, { useState, useEffect } from 'react';
import { getGreeting, formatDateTime } from '../utils/time.js';

export default function GreetingBanner() {
  const [greeting, setGreeting] = useState(getGreeting);
  const [dateStr, setDateStr] = useState(formatDateTime);

  // 每分鐘更新問候語與日期（跨越整點時會更新）
  useEffect(() => {
    const id = setInterval(() => {
      setGreeting(getGreeting());
      setDateStr(formatDateTime());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-3xl font-light text-gray-800 dark:text-gray-100">
        {greeting} <span className="inline-block">👋</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dateStr}</p>
    </div>
  );
}
