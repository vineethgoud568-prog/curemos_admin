import { QueryKey } from '@tanstack/react-query';

import { INotificationConfig } from './routing';

// ============================================
// Base Invalidation Keys
// ============================================

/**
 * Query keys invalidated for every FCM notification regardless of type.
 */
export const baseInvalidateKeys: QueryKey[] = [];

// ============================================
// Notification Route Map
// ============================================

/**
 * Maps FCM notification `type` values to their route + cache config.
 * Add new notification types here — useForeground picks them up automatically.
 */
export const notificationRouteMap: Record<string, INotificationConfig> = {};
