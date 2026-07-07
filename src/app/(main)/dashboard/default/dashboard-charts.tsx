'use client';

import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { useGetDashboardTrends, type TTimeRange } from '@/api/hooks/dashboard/useDashboardTrends';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// 1. Chart Configs
const userGrowthConfig = {
  gpDoctors: {
    label: 'GP Doctors',
    color: 'var(--chart-1)',
  },
  specialistDoctors: {
    label: 'Specialists',
    color: 'var(--chart-2)',
  },
  patients: {
    label: 'Patients',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

const doctorStatusConfig = {
  active: {
    label: 'Active',
    color: 'var(--chart-1)',
  },
  inactive: {
    label: 'Inactive',
    color: 'oklch(0.65 0.11 15.0)', // Reddish-orange
  },
} satisfies ChartConfig;

const consultationConfig = {
  voice: {
    label: 'Voice Call',
    color: 'var(--chart-1)',
  },
  video: {
    label: 'Video Call',
    color: 'var(--chart-2)',
  },
  text: {
    label: 'Text Chat',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;


const reportConfig = {
  total: {
    label: 'Reports Generated',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function DashboardCharts() {
  const [range, setRange] = React.useState<TTimeRange>('30d');
  const [refreshInterval, setRefreshInterval] = React.useState<number>(0); // Default Off (0ms)
  const [consultationView, setConsultationView] = React.useState<'daily' | 'peak'>('daily');
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(['voice', 'video', 'text']);
  const [chartFormat, setChartFormat] = React.useState<'stacked' | 'grouped' | 'line'>('stacked');

  // React Query with client-side Supabase data aggregation
  const { data, isLoading, error, refetch, isFetching } = useGetDashboardTrends(range, refreshInterval);


  const formatDateLabel = (value: string) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/30 mx-4 my-6 flex flex-col items-center justify-center p-12 text-center lg:mx-6">
        <div className="bg-destructive/10 text-destructive mb-4 flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="size-6" />
        </div>
        <CardTitle className="text-lg">Unable to load visual analytics</CardTitle>
        <CardDescription className="mt-2 max-w-md">
          {error.message || 'There was an error communicating with the real-time server.'}
        </CardDescription>
        <Button onClick={() => refetch()} className="mt-6 flex items-center gap-2">
          <RefreshCw className="size-4" /> Retry Connection
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* 2. Toolbar & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-bold tracking-tight">Visual Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Real-time platform insights, user growths, and consultation workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFetching && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Loader2 className="size-3.5 animate-spin" /> Syncing data...
            </div>
          )}

          {/* Time Range Selector */}
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(val) => {
              if (val) setRange(val as TTimeRange);
            }}
            variant="outline"
            className="*:data-[slot=toggle-group-item]:!px-3 bg-card rounded-xl"
          >
            <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 Days</ToggleGroupItem>
          </ToggleGroup>

          {/* Configurable Auto-Refresh Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-[11px] font-medium md:inline">Auto-Refresh:</span>
            <Select
              value={String(refreshInterval)}
              onValueChange={(val) => setRefreshInterval(Number(val))}
            >
              <SelectTrigger className="bg-card w-28 text-xs" size="sm">
                <SelectValue placeholder="Refresh" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="0" className="rounded-lg">Off</SelectItem>
                <SelectItem value="10000" className="rounded-lg">Every 10s</SelectItem>
                <SelectItem value="30000" className="rounded-lg">Every 30s</SelectItem>
                <SelectItem value="60000" className="rounded-lg">Every 1m</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="bg-card size-9 rounded-xl p-0"
            title="Refresh Now"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 3. Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 h-[380px] animate-pulse bg-card/60 border-border/40" />
          <Card className="lg:col-span-1 h-[380px] animate-pulse bg-card/60 border-border/40" />
          <Card className="lg:col-span-2 h-[380px] animate-pulse bg-card/60 border-border/40" />
          <Card className="lg:col-span-1 h-[380px] animate-pulse bg-card/60 border-border/40" />
        </div>
      ) : !data ? null : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* CHART 1: User Growth Trends */}
          <Card className="lg:col-span-2 border-border/40 overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <TrendingUp className="text-primary size-4.5" /> User Growth Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  GP Doctors, Specialist Doctors, and Patients registration rates.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={userGrowthConfig} className="aspect-auto h-[260px] w-full">
                <AreaChart data={data.userGrowth} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillGp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-gpDoctors)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-gpDoctors)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillSpec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-specialistDoctors)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-specialistDoctors)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-patients)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-patients)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatDateLabel}
                    className="text-muted-foreground/80 font-mono text-[10px]"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-muted-foreground/80 font-mono text-[10px]"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={formatDateLabel}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="patients"
                    type="monotone"
                    fill="url(#fillPatients)"
                    stroke="var(--color-patients)"
                    strokeWidth={2}
                    name="patients"
                  />
                  <Area
                    dataKey="gpDoctors"
                    type="monotone"
                    fill="url(#fillGp)"
                    stroke="var(--color-gpDoctors)"
                    strokeWidth={2}
                    name="gpDoctors"
                  />
                  <Area
                    dataKey="specialistDoctors"
                    type="monotone"
                    fill="url(#fillSpec)"
                    stroke="var(--color-specialistDoctors)"
                    strokeWidth={2}
                    name="specialistDoctors"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* CHART 2: Doctor Status Ratio (Active vs Inactive) */}
          <Card className="lg:col-span-1 border-border/40 overflow-hidden rounded-2xl shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Users className="text-primary size-4.5" /> Doctor Status Ratio
              </CardTitle>
              <CardDescription className="text-xs">
                Availability metric tracking active vs inactive doctor profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pt-2">
              {data.doctorStatusRatio.active === 0 && data.doctorStatusRatio.inactive === 0 ? (
                <div className="text-muted-foreground text-xs py-12">No doctor accounts configured.</div>
              ) : (
                <ChartContainer config={doctorStatusConfig} className="mx-auto aspect-square h-[190px] w-full max-w-[200px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={[
                        { name: 'active', value: data.doctorStatusRatio.active },
                        { name: 'inactive', value: data.doctorStatusRatio.inactive },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={75}
                      strokeWidth={3}
                      stroke="var(--card)"
                    >
                      <Cell fill="var(--color-active)" />
                      <Cell fill="var(--color-inactive)" />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
            <CardContent className="border-t border-border/20 pt-4 pb-5">
              <div className="grid grid-cols-2 text-center">
                <div className="border-r border-border/20">
                  <div className="text-foreground text-xl font-bold font-mono">
                    {data.doctorStatusRatio.active}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-[10px] font-semibold mt-0.5">
                    <span className="size-2 rounded-full bg-chart-1" /> Active
                  </div>
                </div>
                <div>
                  <div className="text-foreground text-xl font-bold font-mono">
                    {data.doctorStatusRatio.inactive}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-[10px] font-semibold mt-0.5">
                    <span className="size-2 rounded-full bg-destructive/80" /> Inactive
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CHART 3: Consultation Activity Trends (with Daily vs Peak Hours Toggle) */}
          <Card className="lg:col-span-2 border-border/40 overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Activity className="text-primary size-4.5" /> Consultation Activity
                </CardTitle>
                <CardDescription className="text-xs">
                  {consultationView === 'daily' 
                    ? 'Total volume of consultation sessions grouped by channel type.'
                    : 'Session volume grouped by hour of the day to identify peak usage times.'}
                </CardDescription>
              </div>
              <CardAction className="flex flex-wrap items-center gap-3">
                {/* Category Multi-select Toggles */}
                <ToggleGroup
                  type="multiple"
                  value={selectedTypes}
                  onValueChange={(val) => {
                    // Prevent deselecting everything to keep chart from rendering empty
                    if (val.length > 0) setSelectedTypes(val);
                  }}
                  variant="outline"
                  size="sm"
                  className="*:data-[slot=toggle-group-item]:!px-2.5 bg-card rounded-lg"
                >
                  <ToggleGroupItem value="voice">Voice</ToggleGroupItem>
                  <ToggleGroupItem value="video">Video</ToggleGroupItem>
                  <ToggleGroupItem value="text">Text</ToggleGroupItem>
                </ToggleGroup>

                {/* Chart Format Select */}
                <Select
                  value={chartFormat}
                  onValueChange={(val) => setChartFormat(val as 'stacked' | 'grouped' | 'line')}
                >
                  <SelectTrigger className="bg-card w-[130px] text-xs h-[30px] rounded-lg" size="sm">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="stacked" className="rounded-lg">Stacked Bar</SelectItem>
                    <SelectItem value="grouped" className="rounded-lg">Grouped Bar</SelectItem>
                    <SelectItem value="line" className="rounded-lg">Line Chart</SelectItem>
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="single"
                  value={consultationView}
                  onValueChange={(val) => {
                    if (val) setConsultationView(val as 'daily' | 'peak');
                  }}
                  variant="outline"
                  size="sm"
                  className="*:data-[slot=toggle-group-item]:!px-2 bg-card rounded-lg"
                >
                  <ToggleGroupItem value="daily">
                    <Activity className="mr-1 size-3" /> Volume
                  </ToggleGroupItem>
                  <ToggleGroupItem value="peak">
                    <Clock className="mr-1 size-3" /> Peak Hours
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-2">
              {consultationView === 'daily' ? (
                <ChartContainer config={consultationConfig} className="aspect-auto h-[260px] w-full">
                  {chartFormat === 'line' ? (
                    <LineChart data={data.consultationActivity} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={formatDateLabel}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={formatDateLabel}
                            indicator="line"
                          />
                        }
                      />
                      {selectedTypes.includes('voice') && (
                        <Line
                          dataKey="voice"
                          type="monotone"
                          stroke="var(--color-voice)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 3 }}
                          activeDot={{ r: 5 }}
                          name="voice"
                        />
                      )}
                      {selectedTypes.includes('video') && (
                        <Line
                          dataKey="video"
                          type="monotone"
                          stroke="var(--color-video)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 3 }}
                          activeDot={{ r: 5 }}
                          name="video"
                        />
                      )}
                      {selectedTypes.includes('text') && (
                        <Line
                          dataKey="text"
                          type="monotone"
                          stroke="var(--color-text)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 3 }}
                          activeDot={{ r: 5 }}
                          name="text"
                        />
                      )}
                      <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                  ) : (
                    <BarChart data={data.consultationActivity} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={formatDateLabel}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={formatDateLabel}
                            indicator="dashed"
                          />
                        }
                      />
                      {selectedTypes.includes('voice') && (
                        <Bar
                          dataKey="voice"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-voice)"
                          name="voice"
                          radius={chartFormat === 'stacked' ? [0, 0, 0, 0] : [2, 2, 0, 0]}
                        />
                      )}
                      {selectedTypes.includes('video') && (
                        <Bar
                          dataKey="video"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-video)"
                          name="video"
                          radius={chartFormat === 'stacked' ? [0, 0, 0, 0] : [2, 2, 0, 0]}
                        />
                      )}
                      {selectedTypes.includes('text') && (
                        <Bar
                          dataKey="text"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-text)"
                          name="text"
                          radius={[2, 2, 0, 0]}
                        />
                      )}
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  )}
                </ChartContainer>
              ) : (
                <ChartContainer config={consultationConfig} className="aspect-auto h-[260px] w-full">
                  {chartFormat === 'line' ? (
                    <LineChart data={data.peakUsage} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis
                        dataKey="hour"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={8}
                        className="text-muted-foreground/80 font-mono text-[9px]"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="line"
                          />
                        }
                      />
                      {selectedTypes.includes('voice') && (
                        <Line
                          dataKey="voice"
                          type="monotone"
                          stroke="var(--color-voice)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 2 }}
                          activeDot={{ r: 4 }}
                          name="voice"
                        />
                      )}
                      {selectedTypes.includes('video') && (
                        <Line
                          dataKey="video"
                          type="monotone"
                          stroke="var(--color-video)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 2 }}
                          activeDot={{ r: 4 }}
                          name="video"
                        />
                      )}
                      {selectedTypes.includes('text') && (
                        <Line
                          dataKey="text"
                          type="monotone"
                          stroke="var(--color-text)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 1.5, r: 2 }}
                          activeDot={{ r: 4 }}
                          name="text"
                        />
                      )}
                      <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                  ) : (
                    <BarChart data={data.peakUsage} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis
                        dataKey="hour"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={8}
                        className="text-muted-foreground/80 font-mono text-[9px]"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-muted-foreground/80 font-mono text-[10px]"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dashed"
                          />
                        }
                      />
                      {selectedTypes.includes('voice') && (
                        <Bar
                          dataKey="voice"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-voice)"
                          name="voice"
                          radius={chartFormat === 'stacked' ? [0, 0, 0, 0] : [2, 2, 0, 0]}
                        />
                      )}
                      {selectedTypes.includes('video') && (
                        <Bar
                          dataKey="video"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-video)"
                          name="video"
                          radius={chartFormat === 'stacked' ? [0, 0, 0, 0] : [2, 2, 0, 0]}
                        />
                      )}
                      {selectedTypes.includes('text') && (
                        <Bar
                          dataKey="text"
                          stackId={chartFormat === 'stacked' ? 'a' : undefined}
                          fill="var(--color-text)"
                          name="text"
                          radius={[2, 2, 0, 0]}
                        />
                      )}
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  )}
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* CHART 4: Report Generation Trends */}
          <Card className="lg:col-span-1 border-border/40 overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <FileText className="text-primary size-4.5" /> Reports Generated
              </CardTitle>
              <CardDescription className="text-xs">
                Total generated clinical and operational reports over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={reportConfig} className="aspect-auto h-[260px] w-full">
                <LineChart data={data.reportGeneration} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatDateLabel}
                    className="text-muted-foreground/80 font-mono text-[10px]"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-muted-foreground/80 font-mono text-[10px]"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={formatDateLabel}
                        indicator="line"
                      />
                    }
                  />
                  <Line
                    dataKey="total"
                    type="monotone"
                    stroke="var(--color-total)"
                    strokeWidth={2.5}
                    dot={{ strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="total"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
