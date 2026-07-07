'use client';

import { Icon } from '@iconify-icon/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { NotificationDrawer } from './notification-drawer';

import { mediaUrl } from '@/api/endpoints/endpoints';
import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';


export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const handleMyProfile = () => {
    router.push('/dashboard/profile');
  };

  const handleOpenCommandMenu = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-1 h-10 w-10 shrink-0 text-slate-600 hover:bg-slate-100"
          onClick={toggleSidebar}
        >
          <Icon icon="lucide:menu" className="h-5 w-5 flex items-center justify-center shrink-0" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Button
          variant="outline"
          className="text-muted-foreground w-auto flex-1 md:w-60 md:flex-none justify-start font-normal"
          onClick={handleOpenCommandMenu}
        >
          <Icon icon="lucide:command" className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left truncate">Search...</span>
          <kbd className="text-muted-foreground pointer-events-none ml-auto rounded border px-1.5 py-0.5 text-xs hidden sm:inline-block">
            ⌘K
          </kbd>
        </Button>
        <div className="ml-auto flex items-center gap-3">
          {/* Search Trigger */}

          {/* <ModeToggle /> */}

          <NotificationDrawer />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-slate-100 text-slate-600 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border font-bold hover:opacity-90">
                {user?.profileImage ? (
                  <Image
                    src={mediaUrl(user?.profileImage || '')}
                    alt="avatar"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover object-center"
                  />
                ) : (
                  <span className="text-sm">{getInitials(user?.fullName || '')}</span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 text-slate-600 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border font-bold">
                    {user?.profileImage ? (
                      <Image
                        src={mediaUrl(user?.profileImage || '')}
                        alt="User Avatar"
                        fill
                        className="object-cover object-center"
                      />
                    ) : (
                      <span className="text-xs">{getInitials(user?.fullName || '')}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    {/* <p className="text-muted-foreground text-xs">{user?.role?.roleDisplayName}</p> */}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleMyProfile}>
                <Icon icon="mdi:account" className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <Icon icon="mdi:logout" className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
