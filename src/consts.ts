// 全站常數。改這裡就會 build 時 render 進所有頁面，不靠 runtime JS。

export const SITE_NAME = 'Ted ｜ 財務教練';
export const SITE_URL = 'https://grow.tedshen.link';

// LINE 官方帳號好友連結（全站 CTA 按鈕都指這裡）
export const LINE_URL = 'https://lin.ee/TWsPv3R';

// 諮詢問卷
export const FORM_URL = 'https://forms.gle/GiRtwnPKxajizTHd6';

// 預設 OG／meta 描述（單頁可覆寫）
export const SITE_DESCRIPTION =
  '沈裕德 Ted，軟體工程師出身的財務教練。不推銷，先陪你把資產活化、投資理財與整體財務看清楚，再決定下一步。';

// 官方社群管道（官方管道區塊與 JSON-LD Person.sameAs 共用，改這裡兩邊一起變）
export const THREADS_URL = 'https://www.threads.com/@tedshen.grow';
export const INSTAGRAM_URL = 'https://www.instagram.com/tedshen.grow';
export const EMAIL = 'ted@tedshen.link';

// 官方身分頁（Person 實體的正本在那邊）
export const HUB_URL = 'https://tedshen.link';
// 軟體接案站
export const DEV_URL = 'https://dev.tedshen.link';
// 保險服務站（grow 的 Notes 不連過去，只在 Person.sameAs 宣告是同一個人）
export const PROTECT_URL = 'https://protect.tedshen.link';

// 站主資料（JSON-LD Person / Article author 用）
export const PERSON = {
  name: '沈裕德',
  alternateName: 'Ted Shen',
  jobTitle: '財務教練',
  image: '/avatar.jpg',
  sameAs: [HUB_URL, DEV_URL, PROTECT_URL, THREADS_URL, INSTAGRAM_URL, LINE_URL],
};
