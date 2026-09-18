// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

// sitemap 的 lastmod 從文章 frontmatter 自動萃取（updatedDate 優先，沒有就用 pubDate）。
// 發新文章不用改這裡，build 時會自己算好；列表頁取該區最新一篇的日期。
function buildLastmodMap() {
  /** @type {Map<string, string>} */
  const map = new Map();

  const fmDate = (/** @type {string} */ file) => {
    const src = readFileSync(file, 'utf8');
    const m = src.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return undefined;
    const get = (/** @type {string} */ key) => {
      const mm = m[1].match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
      return mm ? mm[1] : undefined;
    };
    const raw = get('updatedDate') ?? get('pubDate');
    if (!raw) return undefined;
    const t = new Date(raw);
    return Number.isNaN(t.valueOf()) ? undefined : t.toISOString().slice(0, 10);
  };

  const walk = (/** @type {string} */ dir) => {
    let out = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out = out.concat(walk(p));
      else if (e.name.endsWith('.md')) out.push(p);
    }
    return out;
  };

  const collect = (/** @type {string} */ contentDir, /** @type {string} */ urlBase) => {
    let files = [];
    try {
      files = walk(join(rootDir, contentDir));
    } catch {
      return [];
    }
    const dates = [];
    for (const f of files) {
      // glob loader 的 id 是相對於 base 的路徑（去副檔名），跟 sitemap 的 URL 對應
      const rel = f
        .slice(join(rootDir, contentDir).length + 1)
        .replace(/\.md$/, '')
        .replace(/\\/g, '/');
      const d = fmDate(f);
      if (!d) continue;
      map.set(`${urlBase}${rel}/`, d);
      dates.push(d);
    }
    return dates.sort();
  };

  const latest = (/** @type {string[]} */ arr) => (arr.length ? arr[arr.length - 1] : undefined);

  const blogDates = collect('src/content/blog', '/blog/');
  const notesDates = collect('src/content/notes', '/notes/');
  if (latest(blogDates)) map.set('/blog/', latest(blogDates));
  if (latest(notesDates)) map.set('/notes/', latest(notesDates));
  const home = [latest(blogDates), latest(notesDates)].filter(Boolean).sort().pop();
  if (home) map.set('/', home);
  // 靜態頁（非 markdown）用來源檔 mtime 當 lastmod
  for (const [urlPath, srcFile] of [
    ['/disclaimer/', 'src/pages/disclaimer.astro'],
    ['/about/', 'src/pages/about.astro'],
  ]) {
    try {
      map.set(urlPath, statSync(join(rootDir, srcFile)).mtime.toISOString().slice(0, 10));
    } catch {
      // 讀不到就略過，sitemap 照樣輸出只是沒 lastmod
    }
  }
  return map;
}

const lastmodMap = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: 'https://grow.tedshen.link',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = lastmodMap.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  // GitHub Pages 實際服務的是 /path/，統一尾斜線讓 canonical、sitemap、站內連結一致
  trailingSlash: 'always',
  // 舊網址（檔名曾帶 _1 後綴）轉到正確路徑，避免已分享的連結失效
  redirects: {
    '/blog/house-construction-process_1': '/blog/house-construction-process/',
  },
});