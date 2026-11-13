# Threads 每日自動發文

每天 09:00（台北）由 `.github/workflows/threads-daily.yml` 自動發一篇到 @tedshen.grow。

## 怎麼挑當天要發的文
1. `queue/YYYY-MM-DD.md`，而且 `status: approved` → 發這篇。
2. 沒有當天的檔，或還是 `draft` → 改發 `evergreen/` 裡 `status: approved` 的備用文（沒用過的優先，再來是最久沒用的）。
3. `draft` 永遠不會被發出去。

發完後，排程把 queue 檔改成 `status: posted`、備用文記 `last_used`，並 commit 回 repo。

## 檔案格式
```
---
status: draft        # draft → Ted 審過改 approved → 發出後自動變 posted
facet: F             # FORMHD 面向
source: 新聞出處
---
主貼文（500 字以內）
===reply===
第二則（回覆自己，放連結與 LINE）
```

## 寫法規則
- 第一句直接給具體的數字、事實或處境；「這篇寫給…」放第二段。
- 外部連結只放第二則。
- 只做七大銷售循環的前三站（開發、信任、探詢），不做產品說明。
- 不寫買房、房貸、轉貸、增貸、以房養老、會員優惠、8 折買房、包租公、合建、加盟；不招攬特定案子；不談政治。
- 法規與數字附具名媒體或官方來源，寫在 `source` 與第二則。

## 一次性設定（Ted）
1. Meta 開發者後台的 Threads App 加上 `threads_basic`、`threads_content_publish` 權限，產生長效 access token（60 天）。
2. GitHub → TedShen/grow → Settings → Secrets and variables → Actions，新增：
   - `THREADS_ACCESS_TOKEN`
   - `THREADS_USER_ID`
   - （建議）`GH_PAT`：fine-grained token，只給 TedShen/grow 的 Secrets read/write，讓每週一自動續期 token。
3. Actions → Threads daily post → Run workflow（dry_run 打勾）確認會發哪一篇。
