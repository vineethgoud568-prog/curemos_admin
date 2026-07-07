'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Loader2, Mail, Stethoscope, User, FileText, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  useAdminNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useAdminNotificationsRealtime,
  type IAdminNotification,
} from '@/module/notification/hooks/notification.hooks';

export function NotificationDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Real-time subscription for admin notifications
  useAdminNotificationsRealtime();

  const { data: notificationsData, isLoading } = useAdminNotifications(1, pageSize);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data || [];
  const total = notificationsData?.count || 0;
  const hasMore = total > pageSize;

  const handleLoadMore = () => {
    setPageSize((prev) => prev + 10);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to mark notifications as read');
      },
    });
  };

  const handleNotificationClick = (item: IAdminNotification) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    
    setOpen(false);

    switch (item.type) {
      case 'enquiry':
        router.push(item.reference_id ? `/dashboard/enquiry/view/${item.reference_id}` : '/dashboard/enquiry/list');
        break;
      case 'doctor':
        router.push(item.reference_id ? `/dashboard/doctor/view/${item.reference_id}` : '/dashboard/doctor/list');
        break;
      case 'patient':
        router.push(item.reference_id ? `/dashboard/patient/view/${item.reference_id}` : '/dashboard/patient/list');
        break;
      case 'referral':
        router.push(item.reference_id ? `/dashboard/management/referral/view/${item.reference_id}` : '/dashboard/management/referral/list');
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'enquiry':
        return <Mail className="h-5 w-5 text-amber-600" />;
      case 'doctor':
        return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case 'patient':
        return <User className="h-5 w-5 text-emerald-600" />;
      case 'referral':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case 'enquiry':
        return 'bg-amber-50 border-amber-100';
      case 'doctor':
        return 'bg-blue-50 border-blue-100';
      case 'patient':
        return 'bg-emerald-50 border-emerald-100';
      case 'referral':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <Bell className="h-5 w-5 transition-transform hover:rotate-12" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md bg-slate-50 lg:inset-y-auto lg:top-14 lg:bottom-auto lg:right-4 lg:h-[80vh] lg:rounded-xl lg:border lg:shadow-lg lg:overflow-hidden">
        <SheetHeader className="border-b border-slate-100 p-6 pr-14 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <SheetTitle className="text-lg font-bold tracking-tight">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isMarkingAll}
              onClick={handleMarkAllRead}
              className="h-8 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          {isLoading && pageSize === 10 ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">No notifications yet</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[200px]">
                New enquiries, doctor updates, registrations, and referrals will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-5">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative p-4 flex gap-4 transition-all duration-200 cursor-pointer items-start rounded-xl border bg-white shadow-2xs hover:shadow-xs hover:-translate-y-0.5 ${
                    !item.is_read
                      ? 'border-blue-100 ring-1 ring-blue-50/50 bg-blue-50/5'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border ${getNotificationColorClass(item.type)}`}>
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className={`text-sm truncate ${!item.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs line-clamp-2 leading-relaxed mb-2 ${!item.is_read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-2 pb-6 text-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    className="text-xs bg-white shadow-2xs hover:bg-slate-50 rounded-full px-6 border-slate-200"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
