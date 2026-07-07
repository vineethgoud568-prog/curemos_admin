import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { subadminPermissionActions } from '@/module/subadmin/zod/subadmin.schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAllowedPermissions = (moduleName: string) => {
  return subadminPermissionActions.filter((permission) => {
    if (moduleName === 'report' && ['add', 'edit'].includes(permission)) return false;
    if (moduleName === 'referral' && ['add', 'edit'].includes(permission)) return false;
    if (moduleName === 'privacy-policy' && permission !== 'edit') return false;
    if (moduleName === 'terms-and-conditions' && permission !== 'edit') return false;
    if (moduleName === 'contact' && permission !== 'edit') return false;
    if (moduleName === 'banners' && permission !== 'edit') return false;
    if (moduleName === 'enquiry' && permission === 'add') return false;

    return true;
  });
};

export function getInitials(name: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase();
}

export function convertMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}
