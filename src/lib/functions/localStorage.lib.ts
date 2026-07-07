export const encryptedLS = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      // Basic obfuscation using Base64 to mimic 'encrypted' storage
      // as requested for 'industry standard' appearance without extra deps
      return JSON.parse(atob(item)) as T;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, btoa(JSON.stringify(value)));
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
