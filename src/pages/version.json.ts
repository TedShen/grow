// /version.json：線上跑的是哪一版。部署後打開這個網址，就能確認是不是最新的 commit。
// Cloudflare Pages 提供 CF_PAGES_COMMIT_SHA，GitHub Actions 提供 GITHUB_SHA；本機建置兩者都沒有，顯示 local。
export const prerender = true;

export function GET() {
  const body = {
    service: 'tedshen-grow',
    commitSha: process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local',
    builtAt: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
