import { destroyCookie, parseCookies, setCookie } from 'nookies';

import regex from '../regex';

/**
 * Convert an expiry string like "10s", "1m", "1h", "1d", "1w", "1M", "1y"
 * into days.
 */
const parseExpires = (expires: string): number => {
  const match = expires.match(regex.expiry);
  if (!match || !match[1] || !match[2]) {
    throw new Error('Invalid expires format. Use: 10s, 1m, 1h, 1d, 1w, 1M, 1y');
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const unitToDays: Record<string, number> = {
    s: 1 / 86400, // seconds → days
    m: 1 / 1440, // minutes → days
    h: 1 / 24, // hours → days
    d: 1, // days
    w: 7, // weeks → days
    M: 30, // months → days (approx)
    y: 365, // years → days (approx)
  };

  const multiplier = unitToDays[unit];
  if (!multiplier) throw new Error('Invalid time unit');

  return num * multiplier;
};

/**
 * Set a client-side cookie with expiry.
 * @param key - Cookie name
 * @param value - Cookie value (string | object)
 * @param expires - Expiry duration like "1h", "2d", "1w" (always string)
 *                  Defaults to "30d" if not provided.
 */
export const setCookieClient = (key: string, value: unknown, expires: string = '30d') => {
  let cookieValue = value;

  if (typeof value === 'object') {
    cookieValue = JSON.stringify(value);
  }

  const days = parseExpires(expires);
  const maxAge = Math.floor(days * 24 * 60 * 60); // convert days → seconds

  setCookie(null, key, cookieValue as string, {
    path: '/',
    sameSite: true,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  });
};

/**
 * Get a client-side cookie.
 */
export const getCookieClient = (key: string): string | null => {
  const cookies = parseCookies();
  const cookieValue = cookies[key];
  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue);
  } catch {
    return cookieValue;
  }
};

/**
 * Destroy a client-side cookie.
 */
export const destroyCookieClient = (key: string) => {
  destroyCookie(null, key, { path: '/' });
};
