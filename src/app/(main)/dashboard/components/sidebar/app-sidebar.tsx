'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


import { NavMain } from './nav-main';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { projectConfig } from '@/config/project-config';
import { cn } from '@/lib/utils';
import { sidebarItems } from '@/navigation/sidebar/sidebar-items';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={cn(state === 'collapsed' && 'px-0.5')}>
        <SidebarMenu>
          <SidebarMenuItem className={cn('flex items-center', state === 'expanded' ? 'justify-between' : 'justify-center gap-1')}>
            <Link 
              href="/dashboard/default" 
              className={cn('flex items-center gap-2 rounded-md transition-colors hover:bg-slate-100', state === 'expanded' ? 'p-1.5 w-fit' : 'p-0')}
            >
              <Image
                height={20}
                width={20}
                src={projectConfig.logo}
                alt="avatar"
                className="object-cover shrink-0"
              />
              {state === 'expanded' && <span className="text-base font-semibold truncate">{projectConfig.name}</span>}
            </Link>
            <button
              onClick={toggleSidebar}
              className={cn('rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0', state === 'expanded' ? 'p-1.5' : 'p-0.5')}
              aria-label="Toggle Sidebar"
            >
              {state === 'expanded' ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={16} />}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
    </Sidebar>
  );
}
