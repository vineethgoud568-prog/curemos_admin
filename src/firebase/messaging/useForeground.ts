'use client';

import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { baseInvalidateKeys, notificationRouteMap } from './notification-config';
import { buildNotificationUrl } from './routing';

// ============================================
// Types
// ============================================

interface IForegroundPayload {
  data?: Record<string, string>;
  notification?: { title?: string; body?: string };
}

// ============================================
// Query Invalidation
// ============================================

function invalidateNotificationCaches(
  queryClient: QueryClient,
  data: Record<string, string>,
): void {
  const config = data.type ? notificationRouteMap[data.type] : undefined;

  const extraKeys = config?.invalidateKeys ?? [];

  // Reset the infinite notification list back to page 1 only.
  // Using invalidateQueries here would refetch ALL already-loaded pages (1→2→3…),
  // which is wasteful. resetQueries clears the cached pages and refetches only
  // the first page, matching the user's current scroll position after a fresh notification.
  baseInvalidateKeys.forEach(queryKey => {
    queryClient.resetQueries({ queryKey });
  });

  // Non-infinite keys (counts, etc.) are fine with a normal invalidation.
  extraKeys.forEach(queryKey => {
    queryClient.invalidateQueries({ queryKey });
  });
}

// ============================================
// Message Handler
// ============================================

function handleForegroundMessage(event: MessageEvent, queryClient: QueryClient): void {
  if (event.data?.type !== 'FCM_FOREGROUND') return;

  const { notification: notif, data } = (event.data.payload || {}) as IForegroundPayload;
  const title = notif?.title || data?.title || 'New Notification';
  const body = notif?.body || data?.body || '';
  const typedData = (data || {}) as Record<string, string>;

  invalidateNotificationCaches(queryClient, typedData);

  toast.info(title, {
    description: body,
    duration: 5000,
    action: {
      label: 'View',
      onClick: e => {
        e.stopPropagation();
        e.preventDefault();
        window.location.href = buildNotificationUrl(typedData);
      },
    },
  });
}

// ============================================
// Hook
// ============================================

/**
 * Registers a service worker `message` listener that handles FCM foreground
 * notifications — invalidating relevant query caches and showing a toast.
 *
 * Only activates when permission is `granted`.
 */
export function useForegroundMessages(
  permission: NotificationPermission | null,
  queryClient: QueryClient,
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (permission !== 'granted') return;

    const handler = (event: MessageEvent) => handleForegroundMessage(event, queryClient);

    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, [permission, queryClient]);
}
