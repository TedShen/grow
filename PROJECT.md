# grow.tedshen.link — 專案說明與維護紀錄規範

> 這是本專案唯一的交接入口。**任何人（含 AI 助手）對本專案做任何作業，前後都必須讀這份文件，做完必須按文末規範留下紀錄。**
> 舊的 `BLOG-TODO.md` 為歷史文件，內容若與本文衝突以本文為準。

- 網站：https://grow.tedshen.link（Ted ｜ 財務教練）
- 本機路徑：`C:\dev\grow`（刻意不放 OneDrive）
- 技術：Astro 7.2.10（Content Layer API）、Node >= 22.12（本機 v24.18）、GitHub Pages + GitHub Actions 部署
- Repo：`TedShen/grow`（Public，branch `main`）

---

## 1. 這是什麼專案

沈裕德 Ted 的財務教練個人站。定位：**工程師出身的財務教練**。主線是獲客（資產活化、財務規劃），副線是個人學習紀錄（身心靈成長、軟體與工程、保險學習），用同一個站承載以節省維護成本與集中 SEO 權重。

路由一覽：

| 路由 | 來源 | 說明 |
|---|---|---|
| `/` | `src/pages/index.astro` | 首頁 landing（Hero、服務 Zone、見證、最新 3 篇 blog、官方管道、防冒用、CTA） |
| `/about/` | `src/pages/about.astro` | 關於我（品牌故事精簡版＋服務＋官方管道，Person schema） |
| `/blog/` | `src/pages/blog/index.astro` | 主線列表（只顯示 `draft: false`） |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | 主線文章，頁尾 `FooterCTA variant="blog"`（有 LINE CTA） |
| `/notes/` | `src/pages/notes/index.astro` | 副線列表；若有保險分類文章則顯示合規提示 |
| `/notes/[slug]` | `src/pages/notes/[slug].astro` | 副線文章；`保險學習` 分類上下各放合規聲明，頁尾 `variant="notes"`（無招攬） |
| `/disclaimer` | `src/pages/disclaimer.astro` | 免責聲明（保險／投資／外部連結） |
| `/404` | `src/pages/404.astro` | 自訂 404（sitemap 自動排除，不用加 redirect） |
| `/rss.xml` | `src/pages/rss.xml.js` | **只收 blog**，notes 不進主 feed |
| `/sitemap-index.xml` | `@astrojs/sitemap` 自動產生 | 需 `astro.config.mjs` 有設 `site` |

## 2. 關鍵檔案索引

```
astro.config.mjs          site、trailingSlash、redirects（見 §4）、sitemap lastmod 自動萃取（讀 frontmatter，發文不用手動改）
public/CNAME              自訂網域（只能放這裡，見 §4.1）
public/avatar.jpg         頭像｜public/og.jpg 1200×630 預設分享圖｜public/robots.txt
src/consts.ts             全站唯一真相：SITE_URL、LINE_URL、FORM_URL、社群、EMAIL、HUB/DEV/PROTECT、PERSON、CLOUDFLARE_BEACON_TOKEN（空=不輸出追蹤碼）
src/content.config.ts     Content Collections 定義（blog / notes，見 §3）
src/content/blog/*.md     主線文章
src/content/notes/*.md    副線文章
src/layouts/Base.astro    <head>、canonical、OG、JSON-LD、導覽列、頁尾、全站 CSS
src/lib/schema.ts         personSchema / websiteSchema / blogSchema / articleSchema
src/components/FooterCTA.astro        variant="blog" 有 LINE CTA；variant="notes" 無招攬
src/components/OfficialChannels.astro 官方管道＋防冒用聲明（首頁引用）
.github/workflows/deploy.yml          withastro/action 建置＋部署 Pages
drafts/                   不進 build 的草稿（見 §6）
_backup/                  舊 index.html / CNAME 備份，已 gitignore，勿刪勿提交
```

## 3. 內容模型

`src/content.config.ts`（Astro 7 Content Layer 寫法，注意不是舊的 `src/content/config.js`）：

- 共用欄位：`title`、`description`（必填手寫，影響搜尋點擊率）、`pubDate`（`z.coerce.date()`）、`updatedDate?`、`tags[]`、`cover?`、`draft`（預設 `false`）
- `blog` loader `src/content/blog`，`category` 只能是 `資產活化`、`財務規劃`
  - ⚠️ `買房與房貸` 已於 2026-09-04 下架，不要再用（舊 TODO 曾列此分類）
- `notes` loader `src/content/notes`，`category` 只能是 `身心靈成長`、`軟體與工程`、`保險學習`
- 取資料：`getCollection('blog'/'notes')`，單篇 slug 用 **`entry.id`**（不是 `entry.slug`）；渲染用 `import { render } from 'astro:content'` + `await render(entry)` 取 `Content`
- 列表／首頁一律過濾 `draft: true`；正式環境不上草稿
- Slug 規則：**英文語意化、不放日期**（例 `house-construction-process`）。日期進 URL 會讓文章顯舊
- 現有文章（截至 2026-09-18）：`blog/why-engineer-to-coach`、`blog/house-construction-process`、`blog/idle-property-revitalization`、`notes/insurance-learning-note`

## 4. 硬性約束（不可違反，改壞會直接斷站或違規）

1. **`CNAME` 必須在 `public/`**，放根目錄會被 build 清掉，自訂網域失效。
2. **Pages Source 必須是 GitHub Actions**（不是 Deploy from a branch）。工作流程見 `.github/workflows/deploy.yml`，push 到 `main` 即部署。改完到 Settings → Pages 確認，外加驗證 HTTPS 憑證與 LINE 選單左上格 `#services` 錨點。
3. **`trailingSlash: 'always'`** — canonical、sitemap、站內連結全部統一尾斜線。`Base.astro` 會自動補斜線組 canonical；寫連結時手寫尾斜線（`/blog/slug/`）。
4. **舊網址 redirect 要保留**：`astro.config.mjs` 內 `/blog/house-construction-process_1` → `/blog/house-construction-process/`。已分享出去的連結不可斷，新增 slug 更名時比照加一條。
5. **保險合規（主副線分離的真正原因）**：
   - `/notes` 保險文章頁尾**不可放**「加 LINE 幫你規劃」類 CTA（靠 `FooterCTA` 的 `variant` prop 控制，勿繞過）。
   - 保險分類的列表頁＋文章頁頂端各一行：「個人學習紀錄，非保險商品招攬」＋連到 `/disclaimer`；文章頁底部再加一次短聲明。
   - 寫作只寫「我學到什麼」，不寫「你應該買什麼」；不提具體商品名、保費數字、各家比較。
   - 未辦事項：向所屬公司法遵確認個人網站送審門檻（辦了要在 §7 登記）。
6. **LINE／聯絡網址一律吃 `src/consts.ts` 常數**（build 時 render 進 `href`），不准在頁面 hardcode，也不准用 runtime JS 塞連結。`LINE_URL=https://lin.ee/TWsPv3R`，`FORM_URL=https://forms.gle/GiRtwnPKxajizTHd6`。
7. **JSON-LD 改 `src/lib/schema.ts`＋`src/consts.ts`，不要各頁手刻**。`PERSON.sameAs` 目前含 HUB、DEV、PROTECT、Threads、IG、LINE；`knowsAbout` 必須是網站上實際有的服務，不可虛構。
8. **RSS 只收 blog**。notes（含保險）不進主 feed。
9. **LINE 圖文選單與網站路由連動**：左上「我的服務」→ `/#services`、右上「最新活動」→ 傳送文字觸發自動回應、右下「我想諮詢」→ 問卷；左下格待確認（舊紀錄寫「關於我」→ `/`，但 2026-09-18 Ted 確認現況選單上沒有此格，待對照後台重填）。`/about/` 上線與選單無關，不需改選單。改網站路由或錨點 `id` 時要同步更新選單。

## 5. 基礎設施速查

- DNS：Cloudflare，`grow` CNAME → `TedShen.github.io`
- Email：Cloudflare Email Routing，`ted@tedshen.link` → Gmail（只能收）
- 官方帳號：Threads／IG `@tedshen.grow`；身分正本頁 `https://tedshen.link`；軟體線 `https://dev.tedshen.link`；保險服務 `https://protect.tedshen.link`（grow 的 Notes 不連過去，只在 `sameAs` 宣告同一人）
- 色票（沿用，圖文選單已對齊）：`--brand: #1f9d6b`、`--brand-dark: #157a52`、`--line: #06c755`
- 常用指令（專案根目錄執行）：`npm install`、`npm run dev`（localhost:4321）、`npm run build`、`npm run preview`

## 6. 已知待辦（接手先看這裡）

- [x] `/about` 頁（2026-09-18 已上線：`src/pages/about.astro`，品牌故事精簡版＋服務＋官方管道）
- [ ] `drafts/software.astro` 軟體接案導流頁：2026-09-15 寫好暫緩。上線時搬回 `src/pages/`，並在 `Base.astro` 頁尾導覽加連結
- [ ] 頭像換真實照片（現為 watermark 版 `avatar.jpg`）
- [ ] 第一批主線文章：閒置房地活化（已發 2026-09-18）、品牌故事（已發）；危老都更地主問建商問題待寫；保單健檢類注意合規放 notes
- [ ] 法遵確認：個人網站送審門檻、「財務教練」對外行銷素材可用性、富足家內容不重複原則（寫自己視角，結尾連回 everrich.vip）
- [ ] 行銷節奏（FB/IG/Threads）、AdSense（等流量穩定再說）均未定，不要擅自加追蹤碼

## 7. 未來作業紀錄規範（必讀必做）

**任何作業**（改文案、加文章、調樣式、改設定、修 bug、加頁面、動基礎設施）都適用，不分大小。

### 7.1 動手前

1. 先讀本文 §4 硬性約束＋ §6 待辦，確認本次作業不踩線。
2. 大改動先 `npm run dev` 確認現狀；涉及部署／DNS／LINE 選單的，先在 PR 或工作記錄寫影響範圍。

### 7.2 動手後必須更新的三處

1. **本文**：架構、路由、分類、約束、待辦若有變化，直接改對應章節（不要只寫在 commit message）。
2. **文末 Work Log（§8）**：加一筆，格式見 7.3。不寫＝沒做完。
3. **Git commit**：小而清楚，一個 commit 只做一件事。例：`Publish post: <slug>`、`Fix canonical trailing slash`。不要把「順手改」塞進無關 commit。

### 7.3 Work Log 格式（複製貼上）

```md
### 2026-09-18 — <作業標題>（作業人：xxx）
- 動機：
- 變更：檔案／設定／內容（列路徑）
- 驗證：`npm run build` 過／dev 目測／已上線確認（擇實填寫）
- 影響：SEO／合規／LINE 選單／舊連結（無則寫「無」）
- 後續待辦：
```

### 7.4 文章發布檢查清單（發文必跑）

- [ ] frontmatter 齊全：`title`、`description`（手寫）、`pubDate`、`category`（只能用 §3 枚舉）、`tags`、`draft: false`
- [ ] 外部連結原則：結尾 CTA 只留 LINE（不固定連 everrich.vip）；只有內文實質引用富足家資源時才連一次（自然錨文字）
- [ ] slug 英文語意化；更名舊 slug 要在 `astro.config.mjs` 加 redirect
- [ ] 保險主題 → 放 `notes` ＋合規聲明＋`variant="notes"`；非保險獲客文 → 放 `blog` ＋ `variant="blog"`
- [ ] `npm run build` 通過，抽查 canonical／OG／sitemap／RSS 有收錄新文

---

## 8. Work Log（按時間倒序，新紀錄加在最上面）

### 2026-09-18 — 決議：拿掉「每篇結尾固定連 everrich.vip」（作業人：AI 助手建議，Ted 裁示）
- 動機：舊規則（BLOG-TODO 富足家內容原則後半）的 SEO／行銷效益評估
- 變更：§7.4 發文檢查清單加外部連結原則；BLOG-TODO 原文凍結不動（歷史文件，衝突以本文為準）
- 驗證：實抓 everrich.vip 確認——Shopline 商城站、自有文章專欄、獨立 LINE（@rpm4922h，非 grow 的 LINE）
- 影響：已發三篇維持不連；未來只在實質引用時連
- 後續待辦：無

### 2026-09-18 — 發布主線第三篇：閒置房地活化（作業人：AI 助手起草，Ted 定稿）
- 動機：第一批主線文章（§6 待辦）
- 變更：`src/content/blog/idle-property-revitalization.md`（`draft: false`）；分類 `資產活化`；`PROJECT.md` §3／§6 同步
- 驗證：檢查清單全過——build 通過；頁面／sitemap（含 lastmod 2026-09-18，`/blog/` 自動跟著更新）／RSS 皆收錄；canonical、og:type=article、BlogPosting＋Organization publisher、內連五關舊文皆確認
- 影響：新增公開 URL `/blog/idle-property-revitalization/`；everrich 連結未放（待 Ted 決定）
- 後續待辦：下一篇候選「危老都更地主問建商問題」，可回連本篇合作段落

### 2026-09-18 — 起草主線第三篇：閒置房地活化（作業人：AI 助手，Ted 定稿中）
- 動機：第一批主線文章之「手上有閒置的房或地，可以怎麼活化」（§6 待辦）
- 變更：新增 `src/content/blog/idle-property-revitalization.md`（`draft: true`，不上線）；分類 `資產活化`，內連五關舊文
- 驗證：`npm run build` 通過（frontmatter schema 合法）；草稿未進 sitemap／dist／RSS
- 影響：無（草稿不渲染）
- 後續待辦：Ted 改寫定稿 → 翻 `draft: false` → 重跑檢查清單 → commit＋push；everrich 連結要不要放結尾待 Ted 決定

### 2026-09-18 — 更正 LINE 選單紀錄＋確認 beacon 開關為關閉（作業人：AI 助手）
- 動機：Ted 確認選單上無「關於我」格，「改指 `/about/`」事項作廢；另確認 token 未貼時 beacon 零輸出屬正常
- 變更：`PROJECT.md` §4.9（左下格改待確認，移除改選單註記）；未動程式碼
- 驗證：`CLOUDFLARE_BEACON_TOKEN` 仍為空字串，`dist\index.html` 無 beacon——開關邏輯正常（有 token 才輸出）
- 影響：無
- 後續待辦：Ted 對照 LINE 後台，把四格實際對應貼回來填 §4.9；beacon 等 token 到手再按步驟啟用

### 2026-09-18 — Push SEO 修補批次（作業人：AI 助手）
- 動機：推送 warnings＋opportunities 兩批修補與 `/about/` 新頁上線
- 變更：2 commits——①程式 batch（titles、sitemap lastmod、publisher Organization、404、about、fetchpriority、beacon 開關）②`PROJECT.md` 交接更新
- 驗證：`npm run build` 通過（9 頁）；push 後到 GitHub Actions 確認綠燈＋線上抽查 `/about/`、sitemap lastmod
- 影響：列表頁 title 換字、新增 `/about/`、sitemap 結構變化（只加 lastmod，URL 不變）
- 後續待辦（Ted 側）：LINE 左下「關於我」改指 `/about/`；Cloudflare beacon token 貼進 `src/consts.ts`（步驟見對話紀錄）

### 2026-09-18 — 做 SEO 稽核 Opportunities（作業人：AI 助手）
- 動機：稽核 Opportunities 全數落地
- 變更：
  - 首頁＋`drafts/software.astro` avatar 加 `fetchpriority="high"`（JPG 轉 WebP 暫緩：98KB 體積可接受，無轉檔工具鏈）
  - 新增 `src/pages/about.astro`（事實取材自首頁＋品牌故事文，無新編履歷）＋`Base.astro` 頁尾導覽加「關於我」
  - `src/consts.ts` 加 `CLOUDFLARE_BEACON_TOKEN`（空字串）＋`Base.astro` 條件輸出 beacon；token 為空時零輸出（已驗）
  - `<link rel="sitemap">`、`article:modified_time` 維持不動（無害／正常）
  - `astro.config.mjs`：靜態頁（disclaimer、about）lastmod 改用來源檔 mtime，迴圈寫法
- 驗證：`npm run build` 通過（9 頁）；sitemap 8 URLs 皆有 lastmod；beacon 零輸出；about 有 Person schema＋麵包屑
- 影響：新增 `/about/`；LINE 左下「關於我」目前仍指 `/`，Ted 可進後台改指 `/about/`（§4.9 已註記）
- 後續待辦：Cloudflare token 由 Ted 貼上即啟用；WebP 待有圖管流程再說

### 2026-09-18 — 修 SEO 稽核 Warnings（5 項全修）（作業人：AI 助手）
- 動機：SEO 稽核 86/100，五個 warnings 逐項修
- 變更：
  - `src/pages/blog/index.astro`、`src/pages/notes/index.astro`：title 加關鍵字（schema 名稱同步）
  - `astro.config.mjs`：sitemap `serialize` 自動帶 lastmod（frontmatter 萃取，列表頁取該區最新一篇日期）
  - `src/lib/schema.ts`＋兩篇 `[slug].astro`：publisher 改 Organization＋logo，文章 image 接 `cover`（目前無 cover 故 fallback `/og.jpg`）
  - `src/layouts/Base.astro`：導覽列 padding 8px→10px（高度約 46px，達 44px 標準）
  - 新增 `src/pages/404.astro`（sitemap 自動排除）
- 驗證：`npm run build` 通過；dist 內 sitemap 7 URLs 皆有 lastmod、404 不在 sitemap、文章頁 publisher 為 Organization＋logo
- 影響：SEO 正向；title 換字上線後觀察點擊率
- 後續待辦：單篇 cover 配圖（plumbing 已接好，還沒圖）；方形品牌 logo 可替換 og.jpg 作 publisher logo

### 2026-09-18 — SEO 稽核（作業人：AI 助手）
- 動機：全面檢查 crawlability、meta、標題結構、圖片、效能、結構化資料、內連、行動版
- 變更：未動程式碼；報告見對話紀錄（總分 86/100，無 critical）
- 驗證：codebase 對照＋上線站實抓（`/`、`/blog/`、文章頁、`/notes/`、`/disclaimer/`、sitemap、rss、舊網址轉址）
- 影響：無（稽核 only，未改站）
- 後續待辦：Warnings 前三項建議排期修（列表頁 title 關鍵字、sitemap lastmod、Article publisher/logo＋單篇配圖）；`404.astro`、avatar `fetchpriority` 為機會項

### 2026-09-18 — 建立 PROJECT.md 交接文件（作業人：AI 助手）
- 動機：專案知識散落在 `BLOG-TODO.md`、程式碼與 git 歷史，新接手者無單一入口；需明訂「任何作業都要更新與紀錄」的規則
- 變更：新增 `PROJECT.md`（本文）；未動程式碼
- 驗證：全文對照 `src/`、`astro.config.mjs`、`.github/workflows/deploy.yml`、`public/`、`drafts/` 與 `git log` 核對
- 影響：無
- 後續待辦：`BLOG-TODO.md` 是否封存待 Ted 決定；`/about` 與法遵確認仍待辦
