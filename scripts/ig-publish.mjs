// Publish one Instagram post (single image or carousel) from public/ig/<post>/.
// Folder layout: public/ig/<post>/1.jpg, 2.jpg, ... (JPEG only) and caption.txt.
// Images must already be live at https://grow.tedshen.link/ig/<post>/<n>.jpg
// (deploy first), because Instagram fetches them by URL.
//
// Env: IG_ACCESS_TOKEN, IG_USER_ID (repo secrets), POST (folder name),
//      IG_API_HOST (default graph.instagram.com), IG_API_VERSION (default v21.0),
//      DRY_RUN=1 to only print what would be sent.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const { IG_ACCESS_TOKEN, IG_USER_ID, POST, DRY_RUN } = process.env;
const HOST = process.env.IG_API_HOST || 'graph.instagram.com';
const VER = process.env.IG_API_VERSION || 'v21.0';
const SITE = 'https://grow.tedshen.link';

if (!POST || !/^[A-Za-z0-9_-]+$/.test(POST)) throw new Error('POST must be a folder name under public/ig/');
const dir = join('public', 'ig', POST);
const images = readdirSync(dir).filter((f) => /^\d+\.jpe?g$/i.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
if (images.length < 1 || images.length > 10) throw new Error(`Need 1-10 numbered JPEGs, found ${images.length}`);
const caption = readFileSync(join(dir, 'caption.txt'), 'utf8').trim();
const urls = images.map((f) => `${SITE}/ig/${POST}/${f}`);

console.log(`Post ${POST}: ${images.length} image(s)\n${urls.join('\n')}\n---\n${caption}\n---`);
if (DRY_RUN === '1') process.exit(0);
if (!IG_ACCESS_TOKEN || !IG_USER_ID) throw new Error('Missing IG_ACCESS_TOKEN or IG_USER_ID');

// Make sure every image is reachable before asking Instagram to fetch it.
for (const u of urls) {
  const r = await fetch(u, { method: 'HEAD' });
  if (!r.ok) throw new Error(`Image not live yet: ${u} (${r.status})`);
}

const api = async (path, params) => {
  const body = new URLSearchParams({ ...params, access_token: IG_ACCESS_TOKEN });
  const r = await fetch(`https://${HOST}/${VER}/${path}`, { method: 'POST', body });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${path}: ${JSON.stringify(j.error || j)}`);
  return j;
};
const waitReady = async (id) => {
  for (let i = 0; i < 30; i++) {
    const r = await fetch(`https://${HOST}/${VER}/${id}?fields=status_code&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`);
    const j = await r.json();
    if (j.status_code === 'FINISHED') return;
    if (j.status_code === 'ERROR') throw new Error(`Container ${id} failed`);
    await new Promise((s) => setTimeout(s, 3000));
  }
  throw new Error(`Container ${id} not ready in time`);
};

let creationId;
if (urls.length === 1) {
  creationId = (await api(`${IG_USER_ID}/media`, { image_url: urls[0], caption })).id;
} else {
  const children = [];
  for (const u of urls) children.push((await api(`${IG_USER_ID}/media`, { image_url: u, is_carousel_item: 'true' })).id);
  for (const c of children) await waitReady(c);
  creationId = (await api(`${IG_USER_ID}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption })).id;
}
await waitReady(creationId);
const published = await api(`${IG_USER_ID}/media_publish`, { creation_id: creationId });
console.log(`Published media id: ${published.id}`);
