import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const normalizePath = (url: string) => {
  if (!url) return '';
  return url.replace(/\/(list|add|edit|detail)(\/.*)?$/, '');
};

export const cleanUrlParams = (url: string): string => {
  if (!url) return '';
  return url.split('?')[0];
};
export const navigateTo = (router: AppRouterInstance, url: string) => {
  const cleanUrl = cleanUrlParams(url);
  window.history.pushState(null, '', cleanUrl);
  router.replace(cleanUrl);
};
