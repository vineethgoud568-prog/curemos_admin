'use client';

import { Icon } from '@iconify-icon/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useDoctorsCount, useDoctorRealtime } from '@/api/hooks/doctor/hooks';
import { usePendingEnquiriesCount, useEnquiryRealtime } from '@/api/hooks/enquiry/hook';
import { usePatientsCount, usePatientRealtime } from '@/api/hooks/patient/hooks';
import { usePendingReferralsCount, useReferralRealtime } from '@/api/hooks/referral/hooks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/navigation/sidebar/routes';
import {
  type INavGroup,
  type INavMainItem,
  type INavSubItem,
} from '@/navigation/sidebar/sidebar-items';

interface INavMainProps {
  items: INavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

const RenderSubItems = ({ subItems }: { subItems: INavSubItem[] }) => {
  const path = usePathname();

  const isActive = (url: string) => path === url || path.startsWith(url);

  const hasActiveNestedItem = (items?: INavSubItem[]): boolean => {
    if (!items) return false;
    return items.some((item) => isActive(item.url as string) || hasActiveNestedItem(item.subItems));
  };

  return (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.title}>
          {subItem.subItems ? (
            <Collapsible asChild defaultOpen={hasActiveNestedItem(subItem.subItems)}>
              <div>
                <CollapsibleTrigger className="group/trigger w-full" asChild>
                  <SidebarMenuSubButton
                    isActive={
                      isActive(subItem.url as string) || hasActiveNestedItem(subItem.subItems)
                    }
                  >
                    {subItem.icon && <Icon icon={subItem.icon} />}
                    <span>{subItem.title}</span>
                    {subItem.comingSoon && <IsComingSoon />}
                    <Icon
                      icon="mdi:chevron-right"
                      className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90"
                    />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <RenderSubItems subItems={subItem.subItems} />
                </CollapsibleContent>
              </div>
            </Collapsible>
          ) : (
            <SidebarMenuButton
              asChild
              isActive={isActive(subItem.url as string)}
              aria-disabled={subItem.comingSoon}
            >
              <Link href={subItem.url as string}>
                {subItem.icon && <Icon icon={subItem.icon} />}
                <span>{subItem.title}</span>
                {subItem.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
};

export function NavMain({ items }: INavMainProps) {
  const path = usePathname();
  const router = useRouter();
  const { isLoading, isSuperAdmin, permissions } = usePermissions();
  const { data: pendingCount = 0, isSuccess } = usePendingReferralsCount();
  const { data: doctorCount = 0, isSuccess: isDoctorSuccess } = useDoctorsCount();
  const { data: patientCount = 0, isSuccess: isPatientSuccess } = usePatientsCount();
  const { data: pendingEnquiriesCount = 0, isSuccess: isEnquirySuccess } = usePendingEnquiriesCount();

  useReferralRealtime();
  useDoctorRealtime();
  usePatientRealtime();
  useEnquiryRealtime();

  const isFirstRenderReferral = useRef(true);
  const prevCountRef = useRef(pendingCount);

  const isFirstRenderDoctor = useRef(true);
  const prevDoctorCountRef = useRef(doctorCount);

  const isFirstRenderPatient = useRef(true);
  const prevPatientCountRef = useRef(patientCount);

  const isFirstRenderEnquiry = useRef(true);
  const prevEnquiryCountRef = useRef(pendingEnquiriesCount);

  // 1. Referral notifications
  useEffect(() => {
    if (!isSuccess) return;

    if (isFirstRenderReferral.current) {
      isFirstRenderReferral.current = false;
      prevCountRef.current = pendingCount;
      return;
    }

    if (pendingCount > prevCountRef.current && path !== ROUTES.referral.list) {
      toast.success('New Hospital Referral', {
        description: `You have ${pendingCount} pending hospital referrals.`,
        action: {
          label: 'View',
          onClick: () => router.push(ROUTES.referral.list),
        },
      });
    }

    prevCountRef.current = pendingCount;
  }, [pendingCount, path, router, isSuccess]);

  // 2. Doctor notifications
  useEffect(() => {
    if (!isDoctorSuccess) return;

    if (isFirstRenderDoctor.current) {
      isFirstRenderDoctor.current = false;
      prevDoctorCountRef.current = doctorCount;
      return;
    }

    if (doctorCount > prevDoctorCountRef.current && path !== ROUTES.doctor.list) {
      toast.success('New Doctor Added', {
        description: 'A new doctor has been registered.',
        action: {
          label: 'View',
          onClick: () => router.push(ROUTES.doctor.list),
        },
      });
    }

    prevDoctorCountRef.current = doctorCount;
  }, [doctorCount, path, router, isDoctorSuccess]);

  // 3. Patient notifications
  useEffect(() => {
    if (!isPatientSuccess) return;

    if (isFirstRenderPatient.current) {
      isFirstRenderPatient.current = false;
      prevPatientCountRef.current = patientCount;
      return;
    }

    if (patientCount > prevPatientCountRef.current) {
      toast.success('New Patient Added', {
        description: 'A new patient has been registered.',
        action: {
          label: 'View',
          onClick: () => router.push(ROUTES.patient.list),
        },
      });
    }

    prevPatientCountRef.current = patientCount;
  }, [patientCount, path, router, isPatientSuccess]);

  // 4. Enquiry notifications
  useEffect(() => {
    if (!isEnquirySuccess) return;

    if (isFirstRenderEnquiry.current) {
      isFirstRenderEnquiry.current = false;
      prevEnquiryCountRef.current = pendingEnquiriesCount;
      return;
    }

    if (pendingEnquiriesCount > prevEnquiryCountRef.current) {
      toast.success('New Enquiry Received', {
        description: `You have ${pendingEnquiriesCount} pending enquiries.`,
        action: {
          label: 'View',
          onClick: () => router.push(ROUTES.enquiry.list),
        },
      });
    }

    prevEnquiryCountRef.current = pendingEnquiriesCount;
  }, [pendingEnquiriesCount, path, router, isEnquirySuccess]);

  const canShowItem = (item: INavMainItem): boolean => {
    if (isLoading) return false;
    if (isSuperAdmin) return true;

    return permissions.some(
      (permission) => permission.module === item.slug && permission.permission.length > 0,
    );
  };

  const isActiveRecursive = (item: INavMainItem | INavSubItem): boolean => {
    if (path === item.url) return true;
    if (path.includes(item.slug)) return true;

    if (item.subItems?.length) {
      return item.subItems.some((sub) => isActiveRecursive(sub));
    }

    return false;
  };

  const isItemActive = (item: INavMainItem): boolean => {
    return isActiveRecursive(item);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                isActive={path === '/dashboard/default' || path === '/dashboard'}
              >
                <Link className="w-full" href="/dashboard/default">
                  <Icon icon="mdi:view-dashboard" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {items.map((group) => {
        const permittedItems = group.items.filter(canShowItem);

        if (!permittedItems.length) return null;

        return (
          <SidebarGroup key={group.id}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {permittedItems.map((item) => (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isItemActive(item)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        {item.subItems ? (
                          <SidebarMenuButton
                            disabled={item.comingSoon}
                            isActive={isItemActive(item)}
                            tooltip={item.title}
                          >
                            {item.icon && <Icon icon={item.icon} />}
                            <span>{item.title}</span>
                            {item.comingSoon && <IsComingSoon />}

                            <Icon
                              icon="mdi:chevron-right"
                              className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                            />
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            aria-disabled={item.comingSoon}
                            isActive={isItemActive(item)}
                            tooltip={item.title}
                          >
                            {item.url ? (
                              <Link href={item.url}>
                                {item.icon && <Icon icon={item.icon} />}
                                <span className="flex items-center gap-2">
                                  {item.title}
                                  {item.title === 'Hospital Referrals' && (
                                    <span
                                      className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white transition-colors ${
                                        pendingCount > 0 ? 'bg-blue-500 shadow-sm' : 'bg-gray-300'
                                      }`}
                                    >
                                      {pendingCount}
                                    </span>
                                  )}
                                  {item.title === 'Doctors' && (
                                    <span
                                      className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white transition-colors ${
                                        doctorCount > 0 ? 'bg-blue-500 shadow-sm' : 'bg-gray-300'
                                      }`}
                                    >
                                      {doctorCount}
                                    </span>
                                  )}
                                  {item.title === 'Patients' && (
                                    <span
                                      className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white transition-colors ${
                                        patientCount > 0 ? 'bg-blue-500 shadow-sm' : 'bg-gray-300'
                                      }`}
                                    >
                                      {patientCount}
                                    </span>
                                  )}
                                  {item.title === 'Enquiries' && pendingEnquiriesCount > 0 && (
                                    <span
                                      className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white shadow-sm transition-colors"
                                    >
                                      {pendingEnquiriesCount}
                                    </span>
                                  )}
                                </span>
                                {item.comingSoon && <IsComingSoon />}
                              </Link>
                            ) : (
                              <>
                                {item.icon && <Icon icon={item.icon} />}
                                <span>{item.title} </span>
                                {item.comingSoon && <IsComingSoon />}
                              </>
                            )}
                          </SidebarMenuButton>
                        )}
                      </CollapsibleTrigger>

                      {item.subItems && (
                        <CollapsibleContent>
                          <RenderSubItems subItems={item.subItems} />
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}
