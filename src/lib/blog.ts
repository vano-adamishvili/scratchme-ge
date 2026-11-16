export interface Post { slug: string; title: string; description: string; date: string; cover?: string; product?: string; Content: any }
const files = import.meta.glob<any>('../data/blog/*.md', { eager: true });
export const POSTS: Post[] = Object.entries(files).map(([path, m]) => ({
  slug: path.split('/').pop()!.replace(/\.md$/, ''),
  ...m.frontmatter, date: String(m.frontmatter.date instanceof Date ? m.frontmatter.date.toISOString().slice(0, 10) : m.frontmatter.date),
  Content: m.Content,
})).filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));
export const fmtDate = (d: string) => d.split('-').reverse().join('.');
