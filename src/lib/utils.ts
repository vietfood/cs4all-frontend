import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function calculateWordCountFromHtml(
  html: string | null | undefined,
): number {
  if (!html) return 0
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
}

export function readingTime(wordCount: number): string {
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  return `${readingTimeMinutes} min read`
}

export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    3: 'ml-4',
    4: 'ml-8',
    5: 'ml-12',
    6: 'ml-16',
  }
  return margins[depth] || ''
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}
