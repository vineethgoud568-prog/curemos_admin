'use client';

import { 
  Activity, 
  RefreshCw, 
} from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';

type TSystemHealthData = {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
};

export function SystemHealth() {
  const [health, setHealth] = useState<TSystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live system health metrics
  const fetchHealth = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/system/health');
      if (!res.ok) throw new Error('API server returned error status');
      
      const data: TSystemHealthData = await res.json();
      setHealth(data);

      if (showRefreshIndicator) {
        toast.success('System API latency updated.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to query latency:', error);
      toast.error('Connection lost to health monitoring API.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Start polling on mount
  useEffect(() => {
    fetchHealth();
    pollIntervalRef.current = setInterval(() => fetchHealth(false), 5000); // Poll every 5s

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchHealth]);

  // Helpers for visual states
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600 dark:text-emerald-400';
      case 'degraded': return 'text-amber-600 dark:text-amber-400';
      case 'down': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-50 dark:bg-emerald-950/40';
      case 'degraded': return 'bg-amber-50 dark:bg-amber-950/40';
      case 'down': return 'bg-rose-50 dark:bg-rose-950/40';
      default: return 'bg-slate-50 dark:bg-slate-950/40';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'System Online';
      case 'degraded': return 'Response Delayed';
      case 'down': return 'Service Issues';
      default: return 'Loading...';
    }
  };

  const currentStatus = health?.status || 'healthy';

  return (
    <Card
      className="group border-border/40 relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.04]"
    >
      <div className="to-muted/20 pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`flex size-11 items-center justify-center rounded-xl ${getStatusBg(currentStatus)}`}>
            <Activity className={`size-5 ${getStatusColor(currentStatus)} ${currentStatus !== 'healthy' ? 'animate-pulse' : ''}`} />
          </div>
          
          {/* Top right container: Status dot + Refresh Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchHealth(true)}
              disabled={isRefreshing}
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              title="Refresh latency stats"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex h-2.5 w-2.5 relative">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                currentStatus === 'healthy' ? 'bg-emerald-400' : currentStatus === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                currentStatus === 'healthy' ? 'bg-emerald-500' : currentStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className={`text-2xl font-bold tracking-tight ${getStatusColor(currentStatus)}`}>
            {isLoading ? 'Checking...' : getStatusLabel(currentStatus)}
          </p>
          <p className="text-foreground/80 mt-0.5 text-[13px] font-semibold">
            System Health
          </p>
          <div className="text-muted-foreground mt-1 text-[11px] leading-relaxed flex flex-col gap-0.5">
            <span>API Latency: {isLoading ? '...' : health?.latency !== -1 ? `${health?.latency}ms` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
