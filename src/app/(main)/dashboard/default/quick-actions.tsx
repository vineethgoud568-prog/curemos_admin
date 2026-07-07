'use client';

import { Icon } from '@iconify-icon/react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/navigation/sidebar/routes';

interface IQuickActionProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  colorClass: string;
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  colorClass,
}: IQuickActionProps) {
  const CardContent = (
    <div className="group bg-card border-border/50 hover:border-primary/20 relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-[1.5rem] border p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Background Accent */}
      <div
        className={`absolute -top-8 -right-8 size-24 rounded-full opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06] bg-${colorClass}-500`}
      />

      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-2xl p-3 bg-${colorClass}-500/10 transition-colors`}>
          <Icon icon={icon} className={`size-6 text-${colorClass}-500`} />
        </div>
        <Icon
          icon="lucide:arrow-up-right"
          className="text-muted-foreground/40 group-hover:text-primary size-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-foreground group-hover:text-primary font-bold transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="h-full">
        {CardContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="h-full">
      {CardContent}
    </div>
  );
}

export function QuickActions() {
  const { logout } = useAuth();

  const actions = [
    {
      title: 'GP Doctors',
      description: 'Jump into the general practitioner roster and monitor doctor availability.',
      icon: 'mdi:stethoscope',
      href: `${ROUTES.doctor.list}?role=doctor_a`,
      colorClass: 'blue',
    },
    {
      title: 'Curemos Doctors',
      description: 'Review active Curemos doctors and track assigned clinical workloads.',
      icon: 'mdi:doctor',
      href: `${ROUTES.doctor.list}?role=doctor_b`,
      colorClass: 'orange',
    },
    {
      title: 'Patients',
      description: 'Open the patient management area and review current patient records.',
      icon: 'fluent:patient-24-regular',
      href: ROUTES.patient.list,
      colorClass: 'emerald',
    },
    {
      title: 'Logout',
      description: 'Securely end your current administrative session.',
      icon: 'mdi:logout',
      onClick: logout,
      colorClass: 'red',
    },
  ];

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl font-bold tracking-tight">Quick Actions</h2>
        <p className="text-muted-foreground text-sm">
          Instant shortcuts to manage critical platform modules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}
