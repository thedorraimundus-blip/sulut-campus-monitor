import React from 'react';

export interface LoadingStateProps {
  type?: 'card' | 'table' | 'chart' | 'page';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="space-y-3 w-full animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800/40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-[#1a263d] rounded-2xl animate-pulse space-y-4">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-60 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-[#1a263d] rounded-2xl space-y-3">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/40 rounded" />
        </div>
      ))}
    </div>
  );
};
