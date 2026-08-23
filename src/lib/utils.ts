import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SeverityLevel } from '@shared/types/index.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '--';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' IST';
  } catch {
    return '--';
  }
}

export function formatUtcTime(date: Date = new Date()): string {
  return date.toISOString().substring(11, 19) + ' UTC';
}

export function formatIstTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' IST';
}

export function formatCoordinates(lat?: number | null, lng?: number | null): string {
  if (lat == null || lng == null) return '--';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function getSeverityConfig(severity?: SeverityLevel | null): {
  label: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  description: string;
} {
  switch (severity) {
    case 'SEVERE':
      return {
        label: 'SEVERE',
        badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 ring-1 ring-red-500/30 animate-pulse-subtle',
        borderClass: 'border-red-500/40',
        bgClass: 'bg-red-500/10',
        textClass: 'text-red-400',
        description: 'Extreme convective danger: Take immediate life-safety precautions.',
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        borderClass: 'border-orange-500/40',
        bgClass: 'bg-orange-500/10',
        textClass: 'text-orange-400',
        description: 'Severe weather expected: Be prepared for major disruptions.',
      };
    case 'MODERATE':
      return {
        label: 'MODERATE',
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        borderClass: 'border-amber-500/40',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        description: 'Weather watch in effect: Monitor conditions closely.',
      };
    case 'LOW':
      return {
        label: 'LOW',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        borderClass: 'border-emerald-500/40',
        bgClass: 'bg-emerald-500/10',
        textClass: 'text-emerald-400',
        description: 'Normal meteorological baseline: No severe convective threat.',
      };
    default:
      return {
        label: 'AWAITING DATA',
        badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
        borderClass: 'border-slate-500/30',
        bgClass: 'bg-slate-500/10',
        textClass: 'text-slate-400',
        description: 'Awaiting radar ingest and prediction engine evaluation.',
      };
  }
}
