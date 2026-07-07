'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { ROUTES } from '@/navigation/sidebar/routes';
import { sidebarItems } from '@/navigation/sidebar/sidebar-items';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.dashboard) {
      return pathname === href || pathname === `${href}/default`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const constantPages = [
    { label: 'Dashboard', href: ROUTES.dashboard },
    { label: 'My Profile', href: ROUTES.profile.view },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="General">
          {constantPages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => {
                router.push(page.href);
                setOpen(false);
              }}
              className={isActive(page.href) ? 'bg-muted text-primary font-semibold' : ''}
            >
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {sidebarItems.map((group) => (
          <React.Fragment key={group.id}>
            <CommandGroup heading={group.label}>
              {group.items.flatMap((item) => {
                const items: { label: string; href: string }[] = [];

                if (item.url && !item.comingSoon) {
                  items.push({ label: item.title, href: item.url });
                }

                if (item.subItems) {
                  item.subItems.forEach((sub) => {
                    if (sub.url && !sub.comingSoon) {
                      items.push({
                        label: `${item.title} > ${sub.title}`,
                        href: sub.url,
                      });
                    }
                  });
                }

                return items.map((page) => (
                  <CommandItem
                    key={page.href}
                    onSelect={() => {
                      router.push(page.href);
                      setOpen(false);
                    }}
                    className={isActive(page.href) ? 'bg-muted text-primary font-semibold' : ''}
                  >
                    {page.label}
                  </CommandItem>
                ));
              })}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
