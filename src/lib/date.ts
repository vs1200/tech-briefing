const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** Date を YYYY-MM-DD に変換する。front matter の日付は UTC 0 時として読み込まれるため UTC で扱う。 */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year: year!, month: month!, day: day! };
}

export function weekdayOf(dateKey: string): string {
  return WEEKDAYS[new Date(`${dateKey}T00:00:00Z`).getUTCDay()]!;
}

/** 例: 2026年10月11日（日） */
export function formatDateJa(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return `${year}年${month}月${day}日（${weekdayOf(dateKey)}）`;
}

/** 例: 2026年10月 */
export function formatMonthJa(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year}年${month}月`;
}

export { WEEKDAYS };
