// Daily Threads publisher for @tedshen.grow.
//
// Picks today's post (Asia/Taipei date):
//   1. threads/queue/YYYY-MM-DD.md with `status: approved`
//   2. otherwise the first threads/evergreen/*.md with `status: approved`
//      (never-used first, then least recently used)
// Drafts (`status: draft`) are never posted: Ted approves them first.
//
// File format:
//   ---
//   status: approved        # draft | approved | posted
//   facet: H                # FORMHD facet, for the weekly review
//   ---
//   main post text (<= 500 chars)
//   ===reply===
//   reply text posted under the main post (optional)
//
// Env: THREADS_ACCESS_TOKEN, THREADS_USER_ID (repo secrets),
//      DRY_RUN=1 to only print, DATE=YYYY-MM-DD to override today.
// After posting it rewrites the file (status/posted_at/post_id) so the
// workflow can commit the change back.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const { THREADS_ACCESS_TOKEN, THREADS_USER_ID, DRY_RUN } = process.env;
const API = 'https://graph.threads.net/v1.0';
const LIMIT = 500;

const today = process.env.DATE ||
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());

export function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*?)\s*(#.*)?$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  const [main, reply = ''] = m[2].split(/^===reply===$/m);
  return { meta, main: main.trim(), reply: reply.trim() };
}

function serialize({ meta, main, reply }) {
  const head = Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `---\n${head}\n---\n${main}\n${reply ? `===reply===\n${reply}\n` : ''}`;
}

function pick() {
  const q = join('threads', 'queue', `${today}.md`);
  if (existsSync(q)) {
    const p = parse(readFileSync(q, 'utf8'));
    if (p.meta.status === 'posted') return { skip: `queue ${today} already posted` };
    if (p.meta.status === 'approved') return { file: q, post: p, source: 'queue' };
    console.log(`queue ${today} is "${p.meta.status}", not approved: falling back to evergreen`);
  } else {
    console.log(`no queue file for ${today}: falling back to evergreen`);
  }
  const dir = join('threads', 'evergreen');
  const all = readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
    .map((f) => ({ file: join(dir, f), post: parse(readFileSync(join(dir, f), 'utf8')) }))
    .filter((e) => e.post.meta.status === 'approved');
  if (!all.length) return { skip: 'no approved evergreen post left' };
  all.sort((a, b) => (a.post.meta.last_used || '').localeCompare(b.post.meta.last_used || ''));
  return { ...all[0], source: 'evergreen' };
}

async function call(path, params) {
  const body = new URLSearchParams({ ...params, access_token: THREADS_ACCESS_TOKEN });
  const r = await fetch(`${API}/${path}`, { method: 'POST', body });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${path}: ${JSON.stringify(j.error || j)}`);
  return j;
}
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

async function publish(text, replyTo) {
  const params = { media_type: 'TEXT', text };
  if (replyTo) params.reply_to_id = replyTo;
  const { id } = await call(`${THREADS_USER_ID}/threads`, params);
  await sleep(30000); // Meta recommends waiting before publishing a container
  return (await call(`${THREADS_USER_ID}/threads_publish`, { creation_id: id })).id;
}

const chosen = pick();
if (chosen.skip) { console.log(`Nothing to post: ${chosen.skip}`); process.exit(0); }
const { file, post, source } = chosen;
for (const [k, t] of [['main', post.main], ['reply', post.reply]]) {
  if ([...t].length > LIMIT) throw new Error(`${file}: ${k} is ${[...t].length} chars (limit ${LIMIT})`);
}
console.log(`${today} → ${file} (${source}, facet ${post.meta.facet || '-'})\n---\n${post.main}\n---reply---\n${post.reply}\n---`);
if (DRY_RUN === '1') process.exit(0);
if (!THREADS_ACCESS_TOKEN || !THREADS_USER_ID) {
  console.log('::warning::THREADS_ACCESS_TOKEN / THREADS_USER_ID not set; nothing posted');
  process.exit(0);
}

const mainId = await publish(post.main);
console.log(`Published main: ${mainId}`);
let replyId = '';
if (post.reply) {
  try { replyId = await publish(post.reply, mainId); console.log(`Published reply: ${replyId}`); }
  catch (e) { console.log(`::warning::reply failed (main is live): ${e.message}`); }
}
const stamp = new Date().toISOString();
if (source === 'queue') {
  post.meta.status = 'posted';
  post.meta.posted_at = stamp;
} else {
  post.meta.last_used = today;
  post.meta.uses = String(Number(post.meta.uses || 0) + 1);
}
post.meta.post_id = mainId + (replyId ? `,${replyId}` : '');
writeFileSync(file, serialize(post));
