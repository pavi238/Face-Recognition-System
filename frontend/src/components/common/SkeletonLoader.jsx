import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="glass-card p-6 animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      </div>
    ))}
  </div>
);
