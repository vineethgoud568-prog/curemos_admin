import { QueryKey } from '@tanstack/react-query';

import { notificationRouteMap } from './notification-config';

// ============================================
// Types
// ============================================

export interface INotificationConfig {
  /** Destination route path */
  path: string;
  /** Static params always appended to the URL */
  defaultParams?: Record<string, string>;
  /** Keys from notification payload to forward as query params (overrides defaultParams on conflict) */
  paramKeys?: string[];
  /** Query keys to invalidate when this notification type arrives */
  invalidateKeys?: QueryKey[];
}

// ============================================
// URL Builder
// ============================================

/**
 * Builds the redirect URL for a received notification payload.
 * Falls back to `data.link` or `/` if the type is unknown.
 */
export function buildNotificationUrl(data: Record<string, string>): string {
  const config = data.type ? notificationRouteMap[data.type] : undefined;
  if (!config) return data.link || '/';

  const params = new URLSearchParams(config.defaultParams);
  config.paramKeys?.forEach(key => {
    if (data[key]) params.set(key, data[key]);
  });

  const query = params.toString();
  return query ? `${config.path}?${query}` : config.path;
}
