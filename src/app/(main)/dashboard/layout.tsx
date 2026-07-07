import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { CommandMenu } from './components/sidebar/CommandMenu';
import { SiteHeader } from './components/sidebar/site-header';

import { AppSidebar } from '@/app/(main)/dashboard/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface ILayoutProps {
  readonly children: ReactNode;
}


export default async function Layout({ children }: ILayoutProps) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar_state');
  const defaultOpen = sidebarState ? sidebarState.value === 'true' : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <CommandMenu />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
