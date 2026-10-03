import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const dist = resolve('dist');
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? htmlFiles(join(directory, entry.name))
    : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []));
  return nested.flat();
}

const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2].replaceAll('&amp;', '&')]),
);
const images = new Set();
const pages = await htmlFiles(dist);
let verified = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => attributes(match[0]));
  const get = (name) => {
    const matches = metas.filter((meta) => meta.property === name || meta.name === name);
    assert.equal(matches.length, 1, `${file}: missing or duplicate ${name}`);
    return matches[0].content;
  };
  const image = new URL(get('og:image'));
  const canonical = new URL(get('og:url'));
  assert.equal(image.protocol, 'https:', `${file}: OG URL must be absolute HTTPS`);
  assert.equal(image.origin, canonical.origin, `${file}: OG image must be hosted with the site`);
  assert.equal(image.pathname, `/og/${canonical.pathname.split('/').filter(Boolean).join('/') || 'index'}.png`, `${file}: wrong page's image`);
  assert.equal(get('twitter:image'), image.href, `${file}: Twitter and OG must match`);
  assert.equal(get('twitter:card'), 'summary_large_image');
  assert.equal(get('og:image:type'), 'image/png');
  assert.equal(get('og:image:width'), '1200');
  assert.equal(get('og:image:height'), '630');
  assert.ok(get('og:image:alt').trim(), `${file}: missing image description`);
  assert.equal(get('twitter:image:alt'), get('og:image:alt'));
  const segments = canonical.pathname.split('/').filter(Boolean);
  const article = segments.length > 1 && ['pub', 'blurb', 'writings'].includes(segments[0]);
  assert.equal(get('og:type'), article ? 'article' : 'website');
  const info = await sharp(join(dist, decodeURIComponent(image.pathname))).metadata();
  assert.equal(info.format, 'png');
  assert.equal(info.width, 1200);
  assert.equal(info.height, 630);
  assert.ok(!images.has(image.pathname), `${file}: sharing another page's card`);
  images.add(image.pathname);
  verified++;
}
assert.ok(verified > 0, 'No generated pages to verify. Run npm run build first.');
console.log(`Verified ${verified} pages and ${images.size} unique OG cards: PNG, 1200×630, matching absolute OG/Twitter URLs and alt text.`);
