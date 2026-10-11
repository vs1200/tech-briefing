/** Pagefind のブラウザ向け API のうち、このサイトで使う部分の型。 */
export type PagefindSubResult = { title: string; url: string; excerpt: string };

export type PagefindResultData = {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results: PagefindSubResult[];
};

type PagefindSearch = { results: { id: string; data: () => Promise<PagefindResultData> }[] } | null;

type Pagefind = {
  options: (opts: { baseUrl?: string; excerptLength?: number }) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (term: string, opts?: object, timeoutMs?: number) => Promise<PagefindSearch>;
};

const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

/**
 * Pagefind は日本語を細かく分割して部分一致させるため、「脆弱性」が「可能性」にも一致する。
 * 日本語を含む語は引用符で囲み、フレーズとして完全一致させる。
 */
export function toSearchTerm(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (CJK_RE.test(word) && !/^".*"$/.test(word) ? `"${word}"` : word))
    .join(' ');
}

let loading: Promise<Pagefind> | undefined;

/** ビルド時に生成される pagefind.js を読み込む。開発サーバーでは存在しないため失敗する。 */
export function loadPagefind(): Promise<Pagefind> {
  loading ??= (async () => {
    const url = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
    const pagefind = (await import(/* @vite-ignore */ url)) as Pagefind;
    await pagefind.options({ baseUrl: import.meta.env.BASE_URL, excerptLength: 40 });
    await pagefind.init();
    return pagefind;
  })();
  loading.catch(() => (loading = undefined));
  return loading;
}
