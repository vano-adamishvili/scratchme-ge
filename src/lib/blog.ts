// ბლოგი: src/data/blog/*.md (ადმინიდან იწერება).
// ჩანს მხოლოდ გამოქვეყნებული სტატია: draft არ არის და გამოქვეყნების თარიღი დადგა (თბილისის დროით).
// მომავალი თარიღის სტატიას GitHub Action (scheduled-publish.yml) იმ დღეს ახალ build-ს გაუშვებს.
export interface Post {
  slug: string; title: string; description: string; date: string; updated?: string;
  seoTitle?: string; seoDescription?: string; cover?: string; ogImage?: string; coverAlt?: string;
  category?: string; author?: string; product?: string; related?: string[]; draft?: boolean;
  Content: any; minutes: number;
}
const iso = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : undefined);
export const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tbilisi' });
const files = import.meta.glob<any>('../data/blog/*.md', { eager: true });
export const ALL_POSTS: Post[] = Object.entries(files).map(([path, m]) => {
  const fm = m.frontmatter ?? {};
  const words = String(m.rawContent?.() ?? '').split(/\s+/).filter(Boolean).length;
  return {
    ...fm, ...(fm.seo ?? {}),
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    date: iso(fm.date)!, updated: iso(fm.updated),
    related: Array.isArray(fm.related) ? fm.related : [],
    Content: m.Content,
    minutes: Math.max(1, Math.round(words / 180)),
  };
});
export const isPublished = (p: Post) => !p.draft && !!p.date && p.date <= today();
export const POSTS: Post[] = ALL_POSTS.filter(isPublished).sort((a, b) => b.date.localeCompare(a.date));
export const fmtDate = (d: string | Date) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10).split('-').reverse().join('.');
/** დაკავშირებული სტატიები: ჯერ ხელით მითითებული, მერე იმავე კატეგორიის, მერე ახალი */
export const relatedPosts = (p: Post, n = 3) => {
  const others = POSTS.filter((x) => x.slug !== p.slug);
  const picked = [...(p.related ?? []).map((s) => others.find((x) => x.slug === s)).filter(Boolean) as Post[],
    ...others.filter((x) => p.category && x.category === p.category), ...others];
  return [...new Map(picked.map((x) => [x.slug, x])).values()].slice(0, n);
};
