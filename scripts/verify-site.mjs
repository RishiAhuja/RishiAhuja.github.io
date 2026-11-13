import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import ts from 'typescript';
import sharp from 'sharp';
import { SITE_ORIGIN } from '../src/lib/siteConfig.mjs';

const dist = resolve('dist');
async function htmlFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(join(directory, entry.name)) : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []))).flat();
}
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2].replaceAll('&amp;', '&')]));
const pages = await htmlFiles(dist);
const index = new Map();
for (const file of pages) {
  const path = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
  index.set(path, await readFile(file, 'utf8'));
}
const blogFiles = (await readdir('src/content/blogs')).filter((file) => file.endsWith('.md'));
const paperFiles = (await readdir('src/content/research')).filter((file) => file.endsWith('.md'));
const articleSource = await Promise.all(blogFiles.map((file) => readFile(join('src/content/blogs', file), 'utf8')));
const expectedFigures = articleSource.reduce((sum, source) => sum + (source.match(/!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/g) || []).length, 0);
const blurbsSource = ts.createSourceFile('blurb.ts', await readFile('src/data/blurb.ts', 'utf8'), ts.ScriptTarget.Latest, true);
let publishedSlugs = [];
const visit = (node) => {
  if (ts.isVariableDeclaration(node) && node.name.getText() === 'rawBlurbPosts' && ts.isArrayLiteralExpression(node.initializer)) {
    publishedSlugs = node.initializer.elements.filter(ts.isObjectLiteralExpression).flatMap((entry) => {
      const fields = Object.fromEntries(entry.properties.filter(ts.isPropertyAssignment).map((field) => [field.name.getText().replaceAll('"', '').replaceAll("'", ''), ts.isStringLiteral(field.initializer) ? field.initializer.text : undefined]));
      return fields.status === 'published' ? [fields.slug] : [];
    });
  }
  ts.forEachChild(node, visit);
};
visit(blurbsSource);
let figures = 0, contents = 0;
for (const [path, html] of index) {
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: expected one page heading`);
  assert.ok(html.includes('href="#main-content"'), `${path}: missing skip link`);
  assert.ok(html.includes('id="main-content"'), `${path}: missing main target`);
  assert.ok(!html.includes('<astro-island'), `${path}: unnecessary React hydration`);
  assert.ok(!html.includes('katex-error'), `${path}: broken equation`);
  const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)];
  assert.equal(canonicals.length, 1, `${path}: canonical missing or duplicated`);
  const canonical = new URL(attributes(canonicals[0][0]).href);
  assert.equal(canonical.protocol, 'https:');
  assert.equal(canonical.origin, SITE_ORIGIN, `${path}: pages must use the configured canonical origin`);
  // Vercel strips trailing slashes, so a slashed canonical would point at a redirect.
  assert.equal(canonical.pathname, path, `${path}: canonical must be the served path, without a trailing slash`);
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  assert.equal(ogUrl, canonical.href, `${path}: og:url must match the canonical URL`);
  if (/^\/writings\/[^/]+/.test(path)) assert.ok(html.includes('rishi2220.hashnode.dev'), `${path}: article must still link to its Hashnode original`);
  if (/^\/pub\/[^/]+/.test(path)) {
    for (const name of ['citation_title', 'citation_author', 'citation_publication_date', 'citation_conference_title']) assert.ok(html.includes(`name="${name}"`), `${path}: missing ${name}`);
    assert.ok(html.includes('"@type":"ScholarlyArticle"'), `${path}: missing ScholarlyArticle schema`);
  }
  if (/^\/(writings|blurb)\/[^/]+/.test(path)) assert.ok(html.includes('"@type":"BlogPosting"'), `${path}: missing BlogPosting schema`);
  if (path.startsWith('/blurb/')) assert.ok(!/<meta[^>]*content="[^"]*noindex/.test(html), `${path}: published blurb unexpectedly hidden`);
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const attrs = attributes(match[0]);
    assert.ok(Object.hasOwn(attrs, 'alt'), `${path}: image missing alt`);
    if (attrs.class?.includes('blog-image')) {
      assert.ok(attrs.alt?.trim(), `${path}: informative figure has empty alt`);
      assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0, `${path}: missing figure dimensions`);
      figures++;
    }
  }
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = attributes(match[1]);
    if (match[2].includes('class="cover-art"')) assert.ok(attrs['aria-label']?.trim(), `${path}: cover link is unnamed`);
    const href = attrs.href;
    if (!href || !/^(\/[^/]|#)/.test(href)) continue;
    const target = new URL(href, `${SITE_ORIGIN}${path === '/' ? '/' : path + '/'}`);
    const targetPath = target.pathname.replace(/\/$/, '') || '/';
    if (/\.(xml|txt|bib)$/.test(targetPath)) {
      assert.ok((await stat(join(dist, targetPath))).isFile(), `${path}: missing ${href}`);
      continue;
    }
    const targetHtml = index.get(targetPath);
    assert.ok(targetHtml, `${path}: broken internal link ${href}`);
    if (target.hash) assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${path}: broken fragment ${href}`);
  }
  if (html.includes('class="toc"')) {
    assert.ok(html.indexOf('class="toc"') < html.indexOf('class="blog-main'), `${path}: contents must precede article for keyboard users`);
    contents++;
  }
}
assert.equal(figures, expectedFigures, 'Every article figure must be described and dimensioned');
// Author-written blank lines must become separate semantic paragraphs.
const bremen = index.get('/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen');
assert.match(bremen, /<p>João turned out to be a full-time engineer at Amazon\./, 'Bremen paragraph breaks must survive rendering');
// A paper with an official DOI must expose it to Scholar and citation managers.
for (const file of paperFiles) {
  const doi = (await readFile(join('src/content/research', file), 'utf8')).match(/^citation:\n(?:\s+.*\n)*?\s+doi:\s*"([^"]+)"/m)?.[1];
  if (doi) assert.ok(index.get(`/pub/${file.replace(/\.md$/, '')}`).includes(`name="citation_doi" content="${doi}"`), `${file}: DOI missing from citation tags`);
}
// Every paper offers plain-text citations; papers with BibTeX also offer the file.
for (const file of paperFiles) {
  const slug = file.replace(/\.md$/, '');
  const html = index.get(`/pub/${slug}`);
  assert.ok(html.includes('<dt>ACM</dt>') && html.includes('<dt>APA</dt>'), `${slug}: missing plain-text citations`);
  assert.ok(!/<dd>[^<]*\bDr\./.test(html), `${slug}: citations must omit honorifics`);
  if (html.includes('id="bibtex-code"')) {
    assert.ok(html.includes(`href="/pub/${slug}.bib"`), `${slug}: missing BibTeX download`);
    assert.ok((await readFile(join(dist, 'pub', `${slug}.bib`), 'utf8')).includes('@'), `${slug}: empty BibTeX file`);
  }
}
const home = index.get('/');
assert.ok(home.includes('data-age-from="2007-10-03"'), 'Homepage age must be computed from the birth date');
assert.ok(home.includes('href="mailto:'), 'Footer must offer email');
const machine = index.get('/machine');
assert.ok(machine, 'Structured profile page must be built');
for (const file of paperFiles) {
  assert.ok(machine.includes('href="/pub/' + file.replace(/\.md$/, '') + '"'), 'Machine profile must include every current research paper');
}
assert.ok(home.includes('href="/machine"'), 'Structured profile must be discoverable from the footer');

for (const match of home.matchAll(/<time datetime="([^"]+)">([A-Za-z]{3}) (\d{4})<\/time>/g)) {
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(match[2]) + 1;
  assert.equal(match[1], `${match[3]}-${String(month).padStart(2, '0')}`, 'Update date metadata must match its visible month in every timezone');
}
const rows = [...home.matchAll(/<li\b[^>]*data-extra-update[^>]*>/g)];
const updatesSource = await readFile('src/data/updates.ts', 'utf8');
const updatesJS = ts.transpileModule(updatesSource, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
const { updates } = await import(`data:text/javascript;base64,${Buffer.from(updatesJS).toString('base64')}`);
assert.equal(rows.length, updates.length - 8, 'Homepage must show the latest eight updates and collapse all older milestones');
assert.ok(rows.every((row) => /\bhidden\b/.test(row[0])), 'Older updates must begin collapsed');
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.equal(locations.length, 15 + paperFiles.length + publishedSlugs.length + blogFiles.length, 'Sitemap must match canonical published content');
assert.ok(locations.every((path) => path === '/' || !path.endsWith('/')), 'Sitemap URLs must not have trailing slashes');
assert.deepEqual(locations.filter((path) => path.startsWith('/blurb/')).sort(), publishedSlugs.map((slug) => `/blurb/${slug}`).sort());
assert.deepEqual(locations.filter((path) => /^\/writings\//.test(path)).sort(), blogFiles.map((file) => `/writings/${file.replace(/\.md$/, '')}`).sort(), 'Every article must be in the sitemap');
const feed = await readFile(join(dist, 'feed.xml'), 'utf8');
assert.equal((feed.match(/<item>/g) || []).length, blogFiles.length + publishedSlugs.length, 'RSS must match published articles and blurbs');
assert.ok(index.get('/404').includes('noindex, follow'));
// Work pages are direct-share destinations, without a promoted directory.
for (const [workPath] of index) {
  if (!workPath.startsWith('/work/')) continue;
  assert.ok(!locations.includes(workPath), `${workPath}: unlisted work must stay out of the sitemap`);
  assert.ok(!feed.includes(workPath), `${workPath}: unlisted work must stay out of RSS`);
  for (const [otherPath, html] of index) {
    if (otherPath.startsWith('/work/')) continue;
    assert.ok(!html.includes(`href="${workPath}"`), `${otherPath}: unexpected promotion of ${workPath}`);
  }
}


// Blogs retain their original published estimates on detail and archive pages.
const writingArchive = index.get('/writings');
const writingCards = [...writingArchive.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map((match) => match[0]);
for (let i = 0; i < blogFiles.length; i++) {
  const minutes = Number(articleSource[i].match(/^readTimeInMinutes:\s*(\d+)/m)?.[1]);
  const slug = blogFiles[i].replace(/\.md$/, '');
  assert.ok(minutes > 0, `${slug}: original reading estimate missing`);
  assert.ok(index.get(`/writings/${slug}`).includes(` · ${minutes} min read`), `${slug}: detail must retain its original reading estimate`);
  const card = writingCards.find((article) => article.includes(`href="/writings/${slug}"`));
  assert.ok(card?.includes(` · ${minutes} min read`), `${slug}: archive must retain its original reading estimate`);
}

// Blurbs keep their independent reading and media-time calculation.
const source = await readFile('src/lib/readTime.ts', 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
const { getReadTimeBreakdown } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const prose = [{type: 'paragraph', content: Array(150).fill('word').join(' ')}];
assert.equal(getReadTimeBreakdown(prose).totalTime, 1);
assert.equal(getReadTimeBreakdown([...prose, {type: 'video', durationSeconds: 61}]).totalTime, 3);
assert.ok(getReadTimeBreakdown([...prose, {type:'carousel', images:Array(10).fill({src:'image',alt:'photo'})}]).mediaTime > getReadTimeBreakdown([...prose, {type:'carousel', images:[{src:'image',alt:'photo'}]}]).mediaTime);
assert.equal(getReadTimeBreakdown([{type:'video'}]).totalTime, 2);
console.log(`Verified ${pages.length} pages: canonical policy, internal links, headings, ${figures} described figures, ${contents} contents menus, discovery outputs, and reading estimates.`);

// Archived teaching must retain all recorded lectures and their available resources.
const teachingSource = await readFile('src/data/teaching.ts', 'utf8');
const teachingJS = ts.transpileModule(teachingSource, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
const { COURSE, lectures } = await import(`data:text/javascript;base64,${Buffer.from(teachingJS).toString('base64')}`);
assert.equal(lectures.length, 14);
assert.deepEqual(lectures.map(lecture => lecture.day), Array.from({length: 14}, (_, i) => i + 1));
assert.equal(new Set(lectures.map(lecture => lecture.videoUrl)).size, 14);
assert.equal(lectures.filter(lecture => lecture.slidesUrl).length, 13);
assert.equal(COURSE.startDate, '2025-12-18');
assert.equal(COURSE.endDate, '2026-01-14');
const courseHtml = index.get('/flutter-bootcamp');
const curriculumHtml = index.get(COURSE.curriculum);
assert.ok(curriculumHtml, 'Course curriculum must be available on the portfolio');
assert.ok(courseHtml.includes(`href="${COURSE.curriculum}"`), 'Course archive must link to its local curriculum');
for (let day = 1; day <= 14; day++) {
  assert.ok(curriculumHtml.includes(`id="session-${day}"`), `Curriculum session ${day} missing`);
  assert.ok(curriculumHtml.includes(`href="/flutter-bootcamp/#lecture-${day}"`), `Curriculum session ${day} must link back to its recording`);
}
assert.ok(curriculumHtml.includes('Personal information card UI') && curriculumHtml.includes('Play App Signing infrastructure'), 'Curriculum must retain its original assignments and final deployment topics');
for (const lecture of lectures) {
  assert.ok(courseHtml.includes(`id="lecture-${lecture.day}"`));
  assert.ok(courseHtml.includes(lecture.videoUrl.replaceAll('&', '&amp;')));
  if (lecture.slidesUrl) assert.ok(courseHtml.includes(lecture.slidesUrl.replaceAll('&', '&amp;')));
  for (const file of [lecture.artwork, lecture.avif]) {
    const info = await sharp(join(dist, file)).metadata();
    assert.equal(info.width, 1280); assert.equal(info.height, 720);
  }
}
assert.ok(lectures.every((lecture) => machine.includes(lecture.videoUrl.replaceAll('&', '&amp;'))), 'Machine profile must retain every current lecture link');
console.log('Verified archived course: 14 unique videos, 13 slide links, confirmed dates, and 28 landscape image variants.');
