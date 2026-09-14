// JSON-LD 結構化資料產生器。每個函式回傳一個可直接 JSON.stringify 的物件，
// 交給 Base.astro 的 schema prop 輸出。
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, PERSON } from '../consts';

const abs = (p: string) => new URL(p, SITE_URL).href;

/** 站主。首頁放這個，Google 知識面板與防冒用（sameAs 列官方帳號）都靠它。 */
export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    jobTitle: PERSON.jobTitle,
    image: abs(PERSON.image),
    url: SITE_URL,
    sameAs: PERSON.sameAs,
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
  const url = abs(a.path.endsWith('/') ? a.path : `${a.path}/`);
  const author = {
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PERSON.name,
    url: SITE_URL,
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: a.title,
    description: a.description,
    image: abs(a.image ?? PERSON.image),
    datePublished: a.pubDate.toISOString(),
    dateModified: (a.updatedDate ?? a.pubDate).toISOString(),
    author,
    publisher: author,
    inLanguage: 'zh-Hant',
    ...(a.category ? { articleSection: a.category } : {}),
    ...(a.tags?.length ? { keywords: a.tags.join(', ') } : {}),
  };
}
