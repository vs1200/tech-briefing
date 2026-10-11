import { toMonthKey } from './date';

export const ITEM_HEADING_RE = /^(\d+)\.\s+(.+)$/;

type Heading = { depth: number; slug: string; text: string };

/** 新しい日付順に並んだ配列から前日・翌日を返す。 */
export function findNeighbors<T extends { dateKey: string }>(sortedDesc: T[], dateKey: string): { prev?: T; next?: T } {
  const index = sortedDesc.findIndex((n) => n.dateKey === dateKey);
  if (index === -1) return {};
  return { prev: sortedDesc[index + 1], next: sortedDesc[index - 1] };
}

/** 月ごと（新しい順）にまとめる。 */
export function groupByMonth<T extends { dateKey: string }>(sortedDesc: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const n of sortedDesc) {
    const key = toMonthKey(n.dateKey);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  return [...groups.entries()];
}

/** 本文の `## N. 見出し` に付いた ID を、ニュースの並び順に返す。 */
export function itemAnchors(headings: Heading[]): string[] {
  return headings.filter((h) => h.depth === 2 && ITEM_HEADING_RE.test(h.text)).map((h) => h.slug);
}
