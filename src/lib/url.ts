/** base を考慮したサイト内パスを返す。trailingSlash: 'always' に合わせて末尾にスラッシュを付ける。 */
export function path(...segments: string[]): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const joined = segments
    .map((s) => s.replace(/^\/|\/$/g, ''))
    .filter(Boolean)
    .join('/');
  return joined ? `${base}/${joined}/` : `${base}/`;
}

export const newsPath = (dateKey: string) => path('news', dateKey);
export const monthPath = (monthKey: string) => path('archive', monthKey);
export const categoryPath = (slug: string) => path('categories', slug);
