import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMZTime(date: Date | number, formatStr: string = 'yyyy-MM-dd HH:mm:ss') {
  return formatInTimeZone(date, 'Africa/Maputo', formatStr);
}

export function getMZDate() {
  const now = new Date();
  return formatInTimeZone(now, 'Africa/Maputo', "yyyy-MM-dd'T'HH:mm:ssXXX");
}
