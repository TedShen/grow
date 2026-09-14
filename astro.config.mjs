// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://grow.tedshen.link',
  integrations: [sitemap()],
  // 舊網址（檔名曾帶 _1 後綴）轉到正確路徑，避免已分享的連結失效
  redirects: {
    '/blog/house-construction-process_1': '/blog/house-construction-process',
  },
});