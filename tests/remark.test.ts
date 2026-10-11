import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import { remarkCallouts, remarkMermaid } from '../src/lib/remark';

const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkMermaid, remarkCallouts],
  syntaxHighlight: false,
});
const html = async (md: string) => (await processor.render(md)).code;

describe('remarkMermaid', () => {
  it('mermaid のコードブロックを pre.mermaid に置き換え、HTML をエスケープする', async () => {
    const out = await html('```mermaid\nflowchart LR\n  A["<b>"] --> B\n```');
    expect(out).toMatch(
      /^<pre class="mermaid" data-pagefind-ignore="">flowchart LR\n {2}A\["&#x3C;b>"\] --> B<\/pre>$/,
    );
    expect(out).not.toContain('<b>');
  });

  it('ほかの言語のコードブロックは変えない', async () => {
    expect(await html('```ts\nconst a = 1;\n```')).toContain('<code class="language-ts">');
  });
});

describe('remarkCallouts', () => {
  it('`> [!WARNING]` を見出し付きの囲みにする', async () => {
    const out = await html('> [!WARNING]\n> 公称値です。');
    expect(out).toBe(
      '<aside class="callout callout-warning">\n<p class="callout-title">注意</p>\n<p>公称値です。</p>\n</aside>',
    );
  });

  it('記号の後に段落が続く場合も本文を残す', async () => {
    const out = await html('> [!NOTE]\n>\n> 本文です。');
    expect(out).toContain('<p class="callout-title">補足</p>\n<p>本文です。</p>');
  });

  it('通常の引用は変えない', async () => {
    expect(await html('> 引用です。')).toBe('<blockquote>\n<p>引用です。</p>\n</blockquote>');
  });
});
