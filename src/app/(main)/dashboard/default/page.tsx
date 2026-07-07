import { FileText, HeartPulse, Stethoscope, UserCheck, Users } from 'lucide-react';
import type { ElementType } from 'react';

import { DashboardCharts } from './dashboard-charts';
import { QuickActions } from './quick-actions';
import { SystemHealth } from './system-health';
import { WelcomeCard } from './welcome-card';

import { Card } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/dashboard-stats';

export type TOverviewCard = {
  title: string;
  description?: string;
  count: number | string;
  info: string;
  icon: ElementType;
  accentColor: string;
  accentBg: string;
};

export default async function Page() {
  const stats = await getDashboardStats();

  const overviewCards: TOverviewCard[] = [
    {
      title: 'Active Doctors',
      description: 'General practitioners currently available for consultations and follow-ups.',
      count: stats.activeGpDoctors,
      info: '18 doctors are on duty today',
      icon: Stethoscope,
      accentColor: 'text-blue-600',
      accentBg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Active Curemos Doctors',
      description: 'Curemos doctors actively handling assigned cases across the platform.',
      count: stats.activeCuremosDoctors,
      info: '9 are currently managing ongoing cases',
      icon: UserCheck,
      accentColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Active vs Inactive Doctors',
      description:
        'Current split between doctors available for duty and temporarily inactive profiles.',
      count: `${stats.activeDoctors} / ${stats.inactiveDoctors}`,
      info: 'Provider availability is holding at 88%',
      icon: Users,
      accentColor: 'text-violet-600',
      accentBg: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
      title: 'Total Patients',
      description: 'Registered patients currently tracked and managed in the Curemos system.',
      count: stats.totalPatients,
      info: '32 new patient profiles were added this month',
      icon: HeartPulse,
      accentColor: 'text-rose-600',
      accentBg: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      title: 'Reports Generated',
      description: 'Clinical and operational reports generated from doctor and patient activity.',
      count: stats.totalReports,
      info: '14 reports are waiting for final review',
      icon: FileText,
      accentColor: 'text-teal-600',
      accentBg: 'bg-teal-50 dark:bg-teal-950/40',
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <WelcomeCard />
          <div className="space-y-1 px-4 lg:px-6">
            <h2 className="text-foreground text-xl font-bold tracking-tight">System Overview</h2>
            <p className="text-muted-foreground text-sm">
              A quick summary of doctor availability, patient volume, and reporting activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 xl:grid-cols-3 2xl:grid-cols-6">
           
            {overviewCards.map((card) => (
              <Card
                key={card.title}
                className="group border-border/40 relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.04]"
              >
                <div className="to-muted/20 pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl ${card.accentBg}`}
                    >
                      <card.icon className={`size-5 ${card.accentColor}`} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-foreground text-2xl font-bold tracking-tight">
                      {card.count}
                    </p>
                    <p className="text-foreground/80 mt-0.5 text-[13px] font-semibold">
                      {card.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            <SystemHealth />
          </div>

          <QuickActions />
          <DashboardCharts />
        </div>
      </div>
    </div>
  );
}
