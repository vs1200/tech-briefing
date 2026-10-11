import { useEffect, useState, type ReactNode } from 'react';
import { ITEM_HEADING_RE } from '../lib/news';
import { loadPagefind, toSearchTerm, type PagefindResultData, type PagefindSubResult } from '../lib/pagefind';

const MAX_PAGES = 20;
const MAX_SUB_RESULTS = 3;

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; total: number; results: PagefindResultData[] }
  | { status: 'unavailable' };

function initialQuery() {
  return typeof window === 'undefined' ? '' : (new URLSearchParams(location.search).get('q') ?? '');
}

/** Pagefind の excerpt は本文をエスケープしたうえで一致箇所を <mark> で囲んだ HTML。 */
function Excerpt({ html }: { html: string }) {
  return (
    <p
      className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400 [&_mark]:rounded-sm [&_mark]:bg-amber-100 [&_mark]:px-0.5 [&_mark]:text-stone-900 dark:[&_mark]:bg-amber-400/25 dark:[&_mark]:text-amber-100"
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- Pagefind がエスケープ済みの自サイト本文
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** ニュースの見出し（`N. タイトル`）を優先し、なければ他の小見出しを使う。 */
function pickSubResults(subs: PagefindSubResult[]) {
  const anchored = subs.filter((s) => s.url.includes('#'));
  const items = anchored.filter((s) => ITEM_HEADING_RE.test(s.title));
  return (items.length > 0 ? items : anchored).slice(0, MAX_SUB_RESULTS);
}

function Message({ children }: { children: ReactNode }) {
  return <p className="text-sm text-stone-500 dark:text-stone-400">{children}</p>;
}

export default function Search() {
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);

    const term = query.trim();
    if (!term) return;

    let cancelled = false;
    (async () => {
      setState({ status: 'loading' });
      try {
        const pagefind = await loadPagefind();
        const search = await pagefind.debouncedSearch(toSearchTerm(term), {}, 250);
        if (!search || cancelled) return;
        const results = await Promise.all(search.results.slice(0, MAX_PAGES).map((r) => r.data()));
        if (!cancelled) setState({ status: 'done', total: search.results.length, results });
      } catch {
        if (!cancelled) setState({ status: 'unavailable' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const visible = query.trim() ? state : { status: 'idle' as const };

  return (
    <div>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-stone-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: Unity、MCP、Claude Code"
          aria-label="検索キーワード"
          autoFocus
          className="w-full rounded-xl border border-stone-300 bg-white py-3.5 pr-4 pl-12 text-base text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      <div className="mt-8" aria-live="polite">
        {visible.status === 'loading' && <Message>検索しています…</Message>}
        {visible.status === 'unavailable' && (
          <Message>
            検索インデックスが見つかりません。インデックスはビルド時に作られるため、
            <code className="mx-1">pnpm build &amp;&amp; pnpm preview</code>で確認してください。
          </Message>
        )}
        {visible.status === 'done' && visible.results.length === 0 && (
          <Message>「{query.trim()}」に一致するニュースはありませんでした。</Message>
        )}
        {visible.status === 'done' && visible.results.length > 0 && (
          <>
            <Message>
              {visible.total} 日分のニュースが見つかりました
              {visible.total > MAX_PAGES && `（上位 ${MAX_PAGES} 日分を表示）`}
            </Message>
            <ol className="mt-6 space-y-8">
              {visible.results.map((page) => {
                const subs = pickSubResults(page.sub_results);
                return (
                  <li key={page.url}>
                    <a
                      href={page.url}
                      className="text-sm font-bold text-stone-900 transition-colors hover:text-sky-700 dark:text-stone-100 dark:hover:text-sky-300"
                    >
                      {page.meta.title ?? page.url}
                    </a>
                    {subs.length > 0 ? (
                      <ul className="mt-3 space-y-4 border-l-2 border-stone-200 pl-4 dark:border-stone-800">
                        {subs.map((sub) => (
                          <li key={sub.url}>
                            <a
                              href={sub.url}
                              className="leading-relaxed font-medium text-sky-700 transition-colors hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
                            >
                              {sub.title}
                            </a>
                            <Excerpt html={sub.excerpt} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Excerpt html={page.excerpt} />
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
