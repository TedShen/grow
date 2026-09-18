// JSON-LD 結構化資料產生器。每個函式回傳一個可直接 JSON.stringify 的物件，
// 交給 Base.astro 的 schema prop 輸出。
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, PERSON, EMAIL, HUB_URL } from '../consts';

const abs = (p: string) => new URL(p, SITE_URL).href;
const withSlash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/** 站主。首頁放這個，Google 知識面板與防冒用（sameAs 列官方帳號）都靠它。 */
export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    jobTitle: PERSON.jobTitle,
    description: SITE_DESCRIPTION,
    image: abs(PERSON.image),
    // 正式身分頁在 tedshen.link，這裡的 Person 指回去讓 Google 合併成同一個實體
    url: HUB_URL,
    mainEntityOfPage: `${HUB_URL}/`,
    email: EMAIL,
    // 取自首頁服務區塊，不要寫網站上沒有的東西
    knowsAbout: ['財務規劃', '投資理財', '資產活化', '保障規劃', '危老都更', '土地開發合建'],
    sameAs: PERSON.sameAs,
  };
}

interface BlogListInput {
  name: string;
  description: string;
  path: string;
  posts: { title: string; description: string; path: string; pubDate: Date; updatedDate?: Date; image?: string }[];
}

/** 文章列表頁（/blog/、/notes/）。列出旗下文章，讓 Google 知道這是一個內容集合。 */
export function blogSchema(b: BlogListInput) {
  const url = abs(withSlash(b.path));
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    name: b.name,
    description: b.description,
    url,
    inLanguage: 'zh-Hant',
    isPartOf: { '@id': abs('/#website') },
    author: { '@id': abs('/#person') },
    blogPost: b.posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      image: p.image ? abs(p.image) : abs('/og.jpg'),
      url: abs(withSlash(p.path)),
      datePublished: p.pubDate.toISOString(),
      dateModified: (p.updatedDate ?? p.pubDate).toISOString(),
      author: { '@id': abs('/#person') },
    })),
  };
}

/** 網站本身。 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-Hant',
    author: { '@id': abs('/#person') },
  };
}

interface ArticleInput {
  title: string;
  description: string;
  path: string;
  pubDate: Date;
  updatedDate?: Date;
  tags?: string[];
  category?: string;
  image?: string;
}

/** 文章頁（blog 與 notes 共用）。 */
export function articleSchema(a: ArticleInput) {
  const url = abs(withSlash(a.path));
  const author = {
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PERSON.name,
    url: SITE_URL,
  };
  // publisher 用 Organization＋logo，Google Article 富媒體結果才認得；author 維持 Person（站主本人）。
  const publisher = {
    '@type': 'Organization',
    '@id': abs('/#publisher'),
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/og.jpg'),
      width: 1200,
      height: 630,
    },
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: a.title,
    description: a.description,
    image: abs(a.image ?? '/og.jpg'),
    datePublished: a.pubDate.toISOString(),
    dateModified: (a.updatedDate ?? a.pubDate).toISOString(),
    author,
    publisher,
    isPartOf: { '@id': abs('/#website') },
    inLanguage: 'zh-Hant',
    ...(a.category ? { articleSection: a.category } : {}),
    ...(a.tags?.length ? { keywords: a.tags.join(', ') } : {}),
  };
}
