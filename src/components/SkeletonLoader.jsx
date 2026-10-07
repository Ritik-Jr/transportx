import React from 'react';

export default function SkeletonLoader({ type = 'dashboard' }) {
  if (type === 'analytics') {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="h-6 w-48 sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-3 w-64 sm:w-80 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
          </div>
          <div className="h-9 w-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60"></div>
              </div>
              <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
            </div>
          ))}
        </div>

        {/* 2 Main Graph Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-7 w-32 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg"></div>
            </div>
            <div className="h-56 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl flex items-end p-4 gap-2">
              {[40, 65, 30, 85, 55, 70, 95, 60].map((h, idx) => (
                <div key={idx} className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-t-md" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-44 w-44 mx-auto rounded-full border-8 border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <div className="h-10 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
              <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Dashboard Skeleton
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-6 w-52 sm:w-72 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-3 w-64 sm:w-80 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
        </div>
        <div className="h-9 w-60 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
      </div>

      {/* Symmetrical 2x2 on Mobile, 4-Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/60"></div>
            </div>
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-2.5 sm:h-3 w-28 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Grid: Pending Balances & Recent Trips Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left Column Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
              </div>
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
          ))}
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-2.5 w-36 bg-zinc-100 dark:bg-zinc-800/60 rounded-md"></div>
              </div>
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
