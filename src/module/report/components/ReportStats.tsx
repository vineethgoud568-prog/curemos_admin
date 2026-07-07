import { Stethoscope, UserCheck } from 'lucide-react';

import { useReportState } from '@/api/hooks/doctor/hooks';
import { TOverviewCard } from '@/app/(main)/dashboard/default/page';
import { Card } from '@/components/ui/card';
export default function ReportStats() {
  const { data } = useReportState();
  const overviewCards: TOverviewCard[] = [
    {
      title: 'Total Scheduled Consultations',
      count: data?.totalScheduledConsultations ?? 0,
      info: 'Total Scheduled Consultations',
      icon: Stethoscope,
      accentColor: 'text-blue-600',
      accentBg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Total Completed Consultations',
      count: data?.totalConsultationsCompleted ?? 0,
      info: 'Total Completed Consultations',
      icon: Stethoscope,
      accentColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Total Cancelled consultations',
      count: data?.cancelledConsultations ?? 0,
      info: 'Total Cancelled consultations',
      icon: Stethoscope,
      accentColor: 'text-red-600',
      accentBg: 'bg-red-50 dark:bg-red-950/40',
    },
    {
      title: 'Active Curemos Doctors',
      count: data?.activeAccountsCuremos ?? 0,
      info: 'Active Curemos Doctors',
      icon: UserCheck,
      accentColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Active Doctors',
      count: data?.activeAccountsGp ?? 0,
      info: 'Active Doctors',
      icon: UserCheck,
      accentColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:px-6 xl:grid-cols-3 2xl:grid-cols-5">
      {overviewCards.map((card) => (
        <Card
          key={card.title}
          className="group border-border/40 relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/4"
        >
          <div className="to-muted/20 pointer-events-none absolute inset-0 bg-linear-to-br from-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div
                className={`flex size-11 items-center justify-center rounded-xl ${card.accentBg}`}
              >
                <card.icon className={`size-5 ${card.accentColor}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-foreground text-2xl font-bold tracking-tight">{card.count}</p>
              <p className="text-foreground/80 mt-0.5 text-[13px] font-semibold">{card.title}</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
