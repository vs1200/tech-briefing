import { getCollection, render, type CollectionEntry } from 'astro:content';
import { toDateKey } from './date';
import { itemAnchors } from './news';

export type NewsEntry = CollectionEntry<'news'> & { dateKey: string };

let cache: NewsEntry[] | undefined;

/** ニュースを新しい日付順で返す。 */
export async function getNewsList(): Promise<NewsEntry[]> {
  cache ??= (await getCollection('news'))
    .map((entry) => ({ ...entry, dateKey: toDateKey(entry.data.date) }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return cache;
}

/** 各ニュースへのリンク用アンカーを付けて返す。 */
export async function getItemsWithAnchors(entry: NewsEntry) {
  const { headings } = await render(entry);
  const anchors = itemAnchors(headings);
  return entry.data.items.map((item, i) => ({ ...item, index: i + 1, anchor: anchors[i] }));
}
