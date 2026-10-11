// ビルド後の日付ページを調べ、Markdown として解釈されずに残った記法がないか確認する。
// 例: 「**「強調」**が」のような書き方が太字にならず、`**` がそのまま表示されるケース。
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const NEWS_DIR = 'dist/news';
const PATTERNS = [
  { name: '強調記号 **', re: /\*\*/ },
  { name: 'リンク記法 ](', re: /\]\(/ },
];

const problems = [];
for (const date of readdirSync(NEWS_DIR)) {
  const html = readFileSync(join(NEWS_DIR, date, 'index.html'), 'utf-8');
  const prose = html.match(/<div class="prose[^"]*"[^>]*>([\s\S]*)<\/article>/)?.[1] ?? '';
  const text = prose
    .replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&#x26;|&amp;/g, '&');
  for (const line of text.split('\n')) {
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) problems.push(`${date}: ${name}: ${line.trim().slice(0, 80)}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`表示崩れの可能性がある箇所が ${problems.length} 件あります。\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('check-dist: OK');
