import { describe, expect, it } from 'vitest';
import { buildMonthGrid } from '../src/lib/calendar';
import { formatDateJa, formatMonthJa, toDateKey } from '../src/lib/date';
import { findNeighbors, groupByMonth, itemAnchors } from '../src/lib/news';
import { toSearchTerm } from '../src/lib/pagefind';

describe('date', () => {
  it('UTC 基準で YYYY-MM-DD にする', () => {
    expect(toDateKey(new Date('2026-10-11T00:00:00Z'))).toBe('2026-10-11');
  });

  it('日本語の日付と曜日を返す', () => {
    expect(formatDateJa('2026-10-11')).toBe('2026年10月11日（日）');
    expect(formatMonthJa('2026-09')).toBe('2026年9月');
  });
});

describe('buildMonthGrid', () => {
  it('2026年10月は木曜始まりで 5 週', () => {
    const weeks = buildMonthGrid('2026-10');
    expect(weeks).toHaveLength(5);
    expect(weeks[0]!.slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0]![4]).toEqual({ day: 1, dateKey: '2026-10-01' });
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
  });

  it('すべての週が 7 マス', () => {
    for (const week of buildMonthGrid('2026-02')) expect(week).toHaveLength(7);
  });
});

describe('news', () => {
  const list = [{ dateKey: '2026-10-11' }, { dateKey: '2026-10-10' }, { dateKey: '2026-09-30' }];

  it('前日と翌日を返す', () => {
    expect(findNeighbors(list, '2026-10-10')).toEqual({ prev: list[2], next: list[0] });
    expect(findNeighbors(list, '2026-10-11').next).toBeUndefined();
    expect(findNeighbors(list, '2026-09-30').prev).toBeUndefined();
  });

  it('月ごとにまとめる', () => {
    expect(groupByMonth(list).map(([month, items]) => [month, items.length])).toEqual([
      ['2026-10', 2],
      ['2026-09', 1],
    ]);
  });

  it('番号付きの h2 だけをアンカーとして拾う', () => {
    const headings = [
      { depth: 2, slug: 'a', text: '1. 見出し' },
      { depth: 3, slug: 'b', text: '開発者目線' },
      { depth: 2, slug: 'c', text: '2. 見出し' },
      { depth: 2, slug: 'd', text: '👀 今日ならこの3つ' },
    ];
    expect(itemAnchors(headings)).toEqual(['a', 'c']);
  });
});

describe('toSearchTerm', () => {
  it('日本語を含む語だけを引用符で囲む', () => {
    expect(toSearchTerm(' 脆弱性  Unity ')).toBe('"脆弱性" Unity');
    expect(toSearchTerm('Claude Code')).toBe('Claude Code');
    expect(toSearchTerm('"既に引用"')).toBe('"既に引用"');
  });
});
