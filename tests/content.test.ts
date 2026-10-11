import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { CATEGORY_SLUGS } from '../src/data/categories';
import { ITEM_HEADING_RE } from '../src/lib/news';

const NEWS_DIR = join(import.meta.dirname, '../src/content/news');

type FrontMatter = { date: string; summary: string; items: { title: string; categories: string[] }[] };

function load(file: string) {
  const text = readFileSync(join(NEWS_DIR, file), 'utf-8');
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${file}: front matter がありません`);
  return { data: parse(match[1]!) as FrontMatter, body: match[2]! };
}

function itemHeadings(body: string) {
  const headings: { n: number; title: string }[] = [];
  let inCode = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) inCode = !inCode;
    if (inCode || !line.startsWith('## ')) continue;
    const m = ITEM_HEADING_RE.exec(line.slice(3));
    if (m) headings.push({ n: Number(m[1]), title: m[2]!.trim() });
  }
  return headings;
}

const files = readdirSync(NEWS_DIR).filter((f) => f.endsWith('.md'));

describe('ニュース Markdown の書式', () => {
  it('ファイルが存在する', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  describe.each(files)('%s', (file) => {
    const { data, body } = load(file);

    it('ファイル名と date が一致する', () => {
      expect(file).toMatch(/^\d{4}-\d{2}-\d{2}\.md$/);
      expect(String(data.date)).toBe(file.replace(/\.md$/, ''));
    });

    it('summary がある', () => {
      expect(data.summary?.trim()).toBeTruthy();
    });

    it('`## N. 見出し` と items が同じ順序・同じタイトルで並ぶ', () => {
      const headings = itemHeadings(body);
      expect(headings.map((h) => h.n)).toEqual(data.items.map((_, i) => i + 1));
      expect(headings.map((h) => h.title)).toEqual(data.items.map((item) => item.title));
    });

    it('カテゴリが定義済みのものだけ', () => {
      for (const item of data.items) {
        expect(item.categories.length).toBeGreaterThan(0);
        for (const c of item.categories) expect(CATEGORY_SLUGS).toContain(c);
      }
    });

    it('本文に h1 と画像がない', () => {
      expect(body).not.toMatch(/^# /m);
      expect(body).not.toMatch(/!\[[^\]]*\]\(/);
    });

    const lines = proseLines(body);

    it('すべての `##` 見出しの直前に区切り線 `---` がある', () => {
      const missing = lines.filter((l, i) => l.startsWith('## ') && lines[i - 1] !== '---');
      expect(missing).toEqual([]);
    });

    it('まとめ節（👀 📊 🔎）の見出しは `##`', () => {
      expect(lines.filter((l) => /^#{3,} (👀|📊|🔎)/u.test(l))).toEqual([]);
    });

    it('空の箇条書きや ChatGPT の提案文・変換の残骸がない', () => {
      const bad = lines.filter(
        (l) =>
          /^(?:[-*+]|\d+\.)$/.test(l) ||
          /\b(?:If you want|I can:|Let me know|Would you like)\b/i.test(l) ||
          /[-]/u.test(l) ||
          /turn\d+(?:view|search|news|image)\d+/.test(l),
      );
      expect(bad).toEqual([]);
    });
  });
});

/** コードブロックを除いた空でない行（前後の空白を除く）。 */
function proseLines(body: string) {
  const out: string[] = [];
  let inCode = false;
  for (const raw of body.split('\n')) {
    if (raw.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    const line = raw.trim();
    if (!inCode && line) out.push(line);
  }
  return out;
}
