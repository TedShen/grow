# grow.tedshen.link 部落格建置待辦

> 交接文件。放在 repo 根目錄，用 Claude Code 開啟後可直接接續。
> 最後更新：2026-09-01（已針對 Astro 7 修正 Content Collections 語法）

---

## 一、專案現況

### 已完成（不用再動）

**LINE 官方帳號** — 整條動線已通，不需要再改：

| 項目 | 狀態 |
|---|---|
| 諮詢問卷 | https://forms.gle/GiRtwnPKxajizTHd6 |
| 圖文選單 | 已上架，2500×1686 四格 |
| 「最新活動」自動回應 | 已設，關鍵字觸發正常 |
| 數字 1 / 2 / 3 自動回應 | 已補 |
| 歡迎訊息 | 已改寫完成 |
| LINE 好友連結 | https://lin.ee/TWsPv3R |

**圖文選單熱區設定**（記錄用，之後若改網站路由要同步更新）：

| 位置 | 動作 | 目標 |
|---|---|---|
| 左上 我的服務 | 連結 | `https://grow.tedshen.link/#services` |
| 右上 最新活動 | 傳送文字 | `最新活動`（觸發自動回應） |
| 左下 關於我 | 連結 | `https://grow.tedshen.link/` |
| 右下 我想諮詢 | 連結 | 問卷網址 |

**基礎設施**：

- GitHub repo：`TedShen/grow`（Public，根目錄有 `CNAME`、`index.html`）
- GitHub Pages：目前是 Deploy from a branch → main / root
- DNS：Cloudflare，`grow` CNAME → `TedShen.github.io`
- Email：Cloudflare Email Routing，`ted@tedshen.link` → Gmail（只能收信）
- 本機：`C:\dev\grow`，Node v24.18.0，git 2.54.0
  - 刻意不放 OneDrive。舊的 `C:\Users\Ted\OneDrive\12_TrustView_Company\00_MyOwn\everrich` 先留著別刪
- **環境注意**：目前最新 Astro 為 **7.x**。下面 Step 4 已按 Astro 7 的 Content Layer API 改寫，勿再用舊 `type: 'content'` 寫法。

### 建置進度（2026-09-01 已完成）

Astro 7 已初始化並上線。Step 1–7 骨架全部完成：

- ✅ Astro 7.2.10 初始化（minimal 樣板），`CNAME` 已進 `public/`
- ✅ `index.html` 拆成 `Base.astro` + `index.astro`；LINE 連結改成 `src/consts.ts` build 時 render
- ✅ Content Collections（Content Layer API）：`blog`（主線）+ `notes`（副線）
- ✅ 路由：`/blog`、`/blog/[slug]`、`/notes`、`/notes/[slug]`、`/disclaimer`
- ✅ 合規：保險 notes 文章顯示免責聲明、頁尾不放 LINE CTA（`FooterCTA` 的 `variant` prop）
- ✅ SEO/RSS：`@astrojs/sitemap`、`/rss.xml`（僅 blog）、`site` 已設
- ✅ 部署：GitHub Actions（`withastro/action`），Pages Source 已切成 GitHub Actions
- 範例文章各一篇（`why-engineer-to-coach`、`insurance-learning-note`），Ted 可改寫或刪除

**接下來 Ted 要做的**：寫第一批正式文章（見第五節）、`/about` 頁、頭像換照片。

---

## 二、目標架構

### 路由

```
/                首頁（沿用現有 landing 設計）
/about           我是誰：從半導體工程師到財務教練
/blog            主線列表
/blog/[slug]     主線文章
/notes           副線列表
/notes/[slug]    副線文章
/disclaimer      免責聲明
```

### 分類（固定六個，不要開放式長）

**blog（主線）** — 首頁推這區，SEO 與獲客主戰場
- 買房與房貸
- 資產活化
- 財務規劃

**notes（副線）** — 導覽列進得去，不佔首頁版面
- 能量學
- 軟體與工程
- 保險學習

跨主題用 tag 串（例如「首購」「危老」），分類只有這六個。

### 為什麼要分開

能量學、軟體、保險學習跟財務內容的讀者是三群人。混在同一個首頁 feed 會稀釋「財務教練」的專業感，特別是能量學跟財務規劃並列時。但不開兩個網站，因為維護成本雙倍且 SEO 權重分散。

差異化定位：**工程師出身的財務教練**。軟體與能量學的紀錄是這個標籤的佐證，不是雜訊。

---

## 三、硬性約束（不可省略）

1. **`CNAME` 必須放在 `public/`**
   放根目錄的話每次 build 會被清掉，自訂網域直接失效。

2. **GitHub Pages 的 Source 要改成 GitHub Actions**
   目前是 Deploy from a branch，Astro build 出來在 `dist/`，不改會發布錯的東西。

3. **保險內容合規** — 這是主線副線分離的真正原因，不能省
   - `/notes` 的保險文章**頁尾不可放**「加 LINE 幫你規劃」類 CTA
   - Footer CTA 做成元件，用 prop 控制：`variant="blog"` 顯示 LINE CTA，`variant="notes"` 只顯示回列表 / RSS
   - `/notes` 保險分類的列表頁與文章頁頂端各放一行：「本區為個人學習紀錄，非保險商品招攬」，連到 `/disclaimer`
   - 寫作原則：寫「我學到什麼」不寫「你應該買什麼」；不提具體商品名稱、保費數字、各家比較
   - 待辦：向所屬公司法遵確認個人網站的送審門檻

4. **LINE 網址寫成常數**
   現有 `index.html` 是用 runtime JS 把 `LINE_URL` 塞進 `[data-line-link]`（第 210–216 行）。轉 Astro 時改成 build 時直接 render 進 `href`，避免 JS 沒跑時按鈕變死連結。放 `src/consts.js`。

5. **`node_modules` 不要進 OneDrive**（已處理，維持 `C:\dev\`）

---

## 四、執行步驟

### Step 1：備份與初始化

```powershell
cd C:\dev\grow
mkdir _backup
copy index.html _backup\
copy CNAME _backup\
```

**初始化 Astro（非互動）** — `npm create astro@latest .` 是互動式精靈，在自動化環境會卡住等按鍵。改用旗標一次帶過：

```powershell
npm create astro@latest . -- --template minimal --install --no-git --skip-houston --yes
```

- `--template minimal` 對應舊文件的「Empty」
- `--no-git` 保留現有 repo 的 git 歷史
- `--skip-houston --yes` 跳過吉祥物動畫與所有確認
- TypeScript：minimal 樣板預設帶 `tsconfig`，可留著（content collections 的 zod schema 用 `.ts` 反而順）。若堅持純 JS，之後手動處理即可。

驗證：`npm run dev` → 開 `http://localhost:4321` 應看到樣板頁。

### Step 2：搬 CNAME

```powershell
move CNAME public\
```

### Step 3：拆解現有 index.html

把 `_backup\index.html` 拆成：

- `src/consts.js` — `LINE_URL`、`FORM_URL`、站名、預設 OG 描述
- `src/layouts/Base.astro` — `<head>`、meta、OG、全站 CSS 變數與 reset、footer
- `src/components/FooterCTA.astro` — 接受 `variant` prop（`blog` / `notes`）
- `src/pages/index.astro` — 現有 landing 內容

**拆解時順手做的事**：

- ~~服務 Zone 1 加 `id="services"`~~ **已完成**（現有 index.html 第 138 行已有，commit `08da2ed`）。搬進 Astro 時保留即可。
- 「最新分享」區的兩個 `href="#"`（現有 index.html 第 186、190 行）改成真的 `/blog` 文章連結，或先整區隱藏。
- 頭像 "T" 之後換成照片或 logo。

現有色票（沿用，勿改，圖文選單配色與之對齊）：

```css
--brand: #1f9d6b;       /* grow 綠 */
--brand-dark: #157a52;
--line: #06c755;        /* LINE 官方綠 */
```

### Step 4：Content collections（Astro 7 — Content Layer API）

> ⚠️ 舊交接稿用的是 Astro 4 的 `type: 'content'` + `src/content/config.js`，Astro 5 之後已移除。以下為現行寫法。

檔案是 **`src/content.config.ts`**（放專案根的 `src/` 下，不是 `src/content/` 裡）：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  description: z.string(),        // 必填手寫，影響搜尋結果點擊率
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: base.extend({
    category: z.enum(['買房與房貸', '資產活化', '財務規劃']),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: base.extend({
    category: z.enum(['能量學', '軟體與工程', '保險學習']),
  }),
});

export const collections = { blog, notes };
```

跟舊 API 的差異（實作時要注意）：

- 位置：`src/content.config.ts`（不是 `src/content/config.js`）。
- 每個 collection 要有 `loader: glob({...})`，不再用 `type: 'content'`。
- 取資料：`getCollection('blog')` 照舊；但單篇的 slug 從 `entry.slug` 改成 **`entry.id`**。
- 渲染文章：不再是 `entry.render()`，改成
  ```ts
  import { render } from 'astro:content';
  const { Content } = await render(entry);
  ```
- `pubDate` 用 `z.coerce.date()` 讓 frontmatter 的日期字串自動轉 Date。

目錄：`src/content/blog/*.md`、`src/content/notes/*.md`

Slug 規則：**英文語意化，不放日期**。例：`mortgage-refinance-worth-it`。日期進 URL 會讓文章看起來過期。

列表頁要過濾 `draft: true`（正式環境）：
```ts
const posts = (await getCollection('blog')).filter((p) => !p.data.draft);
```

> 註：Astro 版本更新快，實作前對照當前官方 Content Collections 文件再核一次確切 API。

### Step 5：SEO 與 RSS

```powershell
npx astro add sitemap
```

`astro.config.mjs` 設 `site: 'https://grow.tedshen.link'`（sitemap 與 RSS 都需要）。

RSS：裝 `@astrojs/rss`，建 `src/pages/rss.xml.js`。

### Step 6：改用 GitHub Actions 部署

建 `.github/workflows/deploy.yml`（用 `withastro/action`）。

然後到 GitHub → Settings → Pages → Source 改成 **GitHub Actions**。

推上去後確認：
- `https://grow.tedshen.link` 正常
- HTTPS 憑證還在（Enforce HTTPS 可勾）
- LINE 選單左上格點下去會滑到服務區

### Step 7：分析

Cloudflare Web Analytics（無 cookie，不用跳同意條）。腳本加進 `Base.astro`。

---

## 五、第一批文章（Ted 自己寫）

主線先寫客戶會反覆問的問題：

1. ~~房貸轉貸、增貸：什麼情況下真的划算？~~ **（作廢，2026-09-04 買房房貸線下架）**
2. 手上有閒置的房或地，可以怎麼活化？（保留，主線核心）
3. ~~第一次買房，自備款和月付能力怎麼算~~ **（作廢，同上）**
4. 保單健檢：我最常看到的三個缺口 ← 注意合規，考慮放 notes
5. 危老都更合建，地主該問建商哪些問題
6. 我為什麼從半導體工程師走到財務教練（品牌故事，放主線）

節奏：每週一篇。每篇拆成 FB / IG 短貼文導流回部落格，最後收到 LINE。

**富足家內容原則**：不複製公司文章專欄的內容（重複內容傷 SEO）。寫自己的視角——某個案子怎麼評估、實際卡在哪、客戶最常誤解什麼——結尾再連回 everrich.vip。

---

## 六、還沒討論的

- 行銷方式（FB / IG / Threads 的鋪法與節奏）
- `/about` 頁的內容結構
- 富足家合規：確認「財務教練」對外行銷素材可用
- Google AdSense（等有穩定流量再申請）
