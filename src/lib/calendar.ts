export type CalendarCell = { day: number; dateKey: string } | null;

/** 日曜始まりの月カレンダーを週ごとの配列で返す。月の前後の空きマスは null。 */
export function buildMonthGrid(monthKey: string): CalendarCell[][] {
  const [year, month] = monthKey.split('-').map(Number) as [number, number];
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarCell[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, dateKey: `${monthKey}-${String(day).padStart(2, '0')}` });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
