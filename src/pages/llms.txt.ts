// /llms.txt：給 ChatGPT、Claude、Perplexity 這類 AI 助理看的站台摘要（llmstxt.org 的提案格式）。
// 文章與地區頁由資料算出來，新增時自動列進來。llms.txt 是提案不是標準，放了不保證會被引用。
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, LINE_URL, EMAIL, HUB_URL, THREADS_URL } from '../consts';

export const prerender = true;

const areas = Object.values(
  import.meta.glob<{ default: { slug: string; title: string; description: string } }>('../data/area/*.json', { eager: true }),
).map((m) => m.default);

export async function GET() {
  const sortNew = <T extends { data: { pubDate: Date } }>(a: T, b: T) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  const blog = (await getCollection('blog', ({ data }) => !data.draft)).sort(sortNew);
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(sortNew);
  const L: string[] = [];
  L.push(`# ${SITE_NAME}（grow.tedshen.link）`, '', `> ${SITE_DESCRIPTION}`, '');
  L.push('## 基本資訊', '');
  L.push('- 主題：老公寓與閒置房產的選項（都更、危老、整建維護）、把房子放進整體財務規劃一起看。');
  L.push(`- 聯絡：LINE 官方帳號 ${LINE_URL}、Email ${EMAIL}；Threads ${THREADS_URL}`);
  L.push(`- 站主身分頁（官方帳號總表）：${HUB_URL}/`);
  L.push('');
  L.push('## 引用本站前請注意', '');
  L.push('- 文章是觀念整理與公開資料彙整，不是投資建議，也不推薦特定建案。');
  L.push('- 法規、補助、稅率以主管機關最新公告為準；文章內會標資料來源與日期，引用時請一併保留。');
  L.push('');
  L.push(`## 部落格（${SITE_URL}/blog/）`, '');
  for (const p of blog) L.push(`- [${p.data.title}](${SITE_URL}/blog/${p.id}/): ${p.data.description}`);
  L.push('');
  if (areas.length) {
    L.push('## 你家這一帶（地區資料頁）', '');
    for (const a of areas) L.push(`- [${a.title}](${SITE_URL}/area/${a.slug}/): ${a.description}`);
    L.push('');
  }
  if (notes.length) {
    L.push(`## 學習筆記（${SITE_URL}/notes/）`, '');
    for (const p of notes) L.push(`- [${p.data.title}](${SITE_URL}/notes/${p.id}/): ${p.data.description}`);
    L.push('');
  }
  L.push('## 其他', '', `- 關於：${SITE_URL}/about/`, `- 免責聲明：${SITE_URL}/disclaimer/`, `- RSS：${SITE_URL}/rss.xml`, `- Sitemap：${SITE_URL}/sitemap-index.xml`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
