import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  description: z.string(), // 必填手寫，影響搜尋結果點擊率
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
});

// 主線：首頁推這區，SEO 與獲客主戰場
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: base.extend({
    category: z.enum(['買房與房貸', '資產活化', '財務規劃']),
  }),
});

// 副線：導覽列進得去，不佔首頁版面。保險分類需合規處理。
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: base.extend({
    category: z.enum(['能量學', '軟體與工程', '保險學習']),
  }),
});

export const collections = { blog, notes };
