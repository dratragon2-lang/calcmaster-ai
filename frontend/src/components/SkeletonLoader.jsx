import React from 'react';

export const ChartSkeleton = () => {
  return (
    <div className="w-full h-[320px] p-4 bg-zinc-950/20 border border-white/5 rounded-xl flex flex-col justify-between animate-skeleton">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-white/5 rounded"></div>
        <div className="h-3 w-16 bg-white/5 rounded"></div>
      </div>
      <div className="flex-1 flex items-end space-x-3 px-2 pt-6 pb-2">
        <div className="h-1/3 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-1/2 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-2/3 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-3/4 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-1/2 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-2/5 flex-1 bg-white/5 rounded-t"></div>
        <div className="h-3/5 flex-1 bg-white/5 rounded-t"></div>
      </div>
      <div className="h-2 w-full bg-white/5 rounded"></div>
    </div>
  );
};

export const StepsSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 bg-white/5 rounded animate-skeleton"></div>
      <div className="space-y-2">
        <div className="h-10 w-full bg-zinc-950/20 border border-white/5 rounded-lg animate-skeleton"></div>
        <div className="h-12 w-full bg-zinc-950/20 border border-white/5 rounded-lg animate-skeleton"></div>
        <div className="h-10 w-full bg-zinc-950/20 border border-white/5 rounded-lg animate-skeleton"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="saas-card p-6 md:p-8 bg-[#0a0a0f]/60 border border-white/5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-white/5 rounded animate-skeleton"></div>
          <div className="h-6 w-48 bg-white/5 rounded animate-skeleton"></div>
        </div>
        <div className="h-8 w-24 bg-white/5 rounded-lg animate-skeleton"></div>
      </div>

      <div className="p-6 bg-zinc-950/80 border border-white/5 rounded-xl space-y-2">
        <div className="h-3.5 w-32 bg-white/5 rounded animate-skeleton"></div>
        <div className="h-8 w-64 bg-white/5 rounded animate-skeleton"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        <StepsSkeleton />
        <div className="space-y-4">
          <div className="h-4 w-32 bg-white/5 rounded animate-skeleton"></div>
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
};

export const HistorySkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="saas-card p-5 bg-[#0a0a0f]/60 border border-white/5 flex items-center justify-between gap-4 animate-skeleton"
        >
          <div className="flex-1 space-y-3">
            <div className="flex space-x-2">
              <div className="h-5 w-16 bg-white/5 rounded-full"></div>
              <div className="h-4 w-28 bg-white/5 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-32 bg-white/5 rounded"></div>
              <div className="h-4 w-4 bg-white/5 rounded"></div>
              <div className="h-6 w-24 bg-white/5 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
            <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
            <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
