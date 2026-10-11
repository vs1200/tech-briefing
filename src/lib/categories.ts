import type { CategorySlug } from '../data/categories';
import { getItemsWithAnchors, getNewsList } from './content';

export type CategorizedItem = {
  dateKey: string;
  index: number;
  title: string;
  anchor: string | undefined;
  categories: CategorySlug[];
};

/** 全ニュースを新しい順に平坦化して返す。 */
export async function getAllItems(): Promise<CategorizedItem[]> {
  const news = await getNewsList();
  const perDay = await Promise.all(
    news.map(async (entry) => (await getItemsWithAnchors(entry)).map((item) => ({ ...item, dateKey: entry.dateKey }))),
  );
  return perDay.flat();
}
