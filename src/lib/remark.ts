import type { Paragraph, Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** ```mermaid のコードブロックを、ブラウザで図に変換する `<pre class="mermaid">` に置き換える。 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return;
      parent.children[index] = {
        type: 'html',
        value: `<pre class="mermaid" data-pagefind-ignore>${escapeHtml(node.value)}</pre>`,
      };
    });
  };
}

export const CALLOUT_TITLES = {
  NOTE: '補足',
  TIP: 'ヒント',
  IMPORTANT: '重要',
  WARNING: '注意',
  CAUTION: '警告',
} as const;

const CALLOUT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/;

/** GitHub と同じ `> [!NOTE]` 記法の引用を、種類と見出し付きの囲み（callout）にする。 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const text = first.children[0];
      if (text?.type !== 'text') return;
      const match = CALLOUT_RE.exec(text.value);
      if (!match) return;

      const kind = match[1] as keyof typeof CALLOUT_TITLES;
      text.value = text.value.slice(match[0].length);
      if (text.value === '') first.children.shift();
      if (first.children.length === 0) node.children.shift();

      const title: Paragraph = {
        type: 'paragraph',
        children: [{ type: 'text', value: CALLOUT_TITLES[kind] }],
        data: { hProperties: { className: ['callout-title'] } },
      };
      node.children.unshift(title);
      node.data = { hName: 'aside', hProperties: { className: ['callout', `callout-${kind.toLowerCase()}`] } };
    });
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
