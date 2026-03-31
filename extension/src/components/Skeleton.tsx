import React from 'react';

function SkeletonCard({ isHero = false }: { isHero?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 ${isHero ? 'row-span-2' : ''}`}>
      <div className={`skeleton ${isHero ? 'h-52' : 'h-36'}`} />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-4 w-16 rounded-full" />
          <div className="skeleton h-4 w-4 rounded" />
        </div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex justify-between mt-2">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} isHero={i === 0} />
      ))}
    </div>
  );
}
