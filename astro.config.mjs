// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://grow.tedshen.link',
  integrations: [sitemap()],
  // GitHub Pages 實際服務的是 /path/，統一尾斜線讓 canonical、sitemap、站內連結一致
  trailingSlash: 'always',
  // 舊網址（檔名曾帶 _1 後綴）轉到正確路徑，避免已分享的連結失效
  redirects: {
    '/blog/house-construction-process_1': '/blog/house-construction-process/',
  },
});