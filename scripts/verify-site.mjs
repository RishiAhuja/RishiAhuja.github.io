import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import ts from 'typescript';

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
  if (/^\/writings\/[^/]+/.test(path)) assert.equal(canonical.hostname, 'rishi2220.hashnode.dev', `${path}: mirror must credit original canonical`);
  else assert.equal(canonical.hostname, 'rishiahuja.github.io', `${path}: first-party content must remain canonical here`);
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
    const target = new URL(href, `https://rishiahuja.github.io${path === '/' ? '/' : path + '/'}`);
    const targetPath = target.pathname.replace(/\/$/, '') || '/';
    if (targetPath.endsWith('.xml') || targetPath.endsWith('.txt')) {
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
const home = index.get('/');
for (const match of home.matchAll(/<time datetime="([^"]+)">([A-Za-z]{3}) (\d{4})<\/time>/g)) {
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(match[2]) + 1;
  assert.equal(match[1], `${match[3]}-${String(month).padStart(2, '0')}`, 'Update date metadata must match its visible month in every timezone');
}
const rows = [...home.matchAll(/<li\b[^>]*data-extra-update[^>]*>/g)];
assert.equal(rows.length, 7, 'Homepage must collapse only the seven older updates');
assert.ok(rows.every((row) => /\bhidden\b/.test(row[0])), 'Older updates must begin collapsed');
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.equal(locations.length, 4 + paperFiles.length + publishedSlugs.length, 'Sitemap must match canonical published content');
assert.deepEqual(locations.filter((path) => path.startsWith('/blurb/')).sort(), publishedSlugs.map((slug) => `/blurb/${slug}`).sort());
assert.ok(!locations.some((path) => /^\/writings\//.test(path)), 'Mirrored articles should not claim a local sitemap canonical');
const feed = await readFile(join(dist, 'feed.xml'), 'utf8');
assert.equal((feed.match(/<item>/g) || []).length, blogFiles.length + publishedSlugs.length, 'RSS must match published articles and blurbs');
assert.ok(index.get('/404').includes('noindex, follow'));

// Check reading-time behavior at media and word-count boundaries.
const source = await readFile('src/lib/readTime.ts', 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
const { getReadTimeBreakdown, calculateMarkdownReadTime } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const prose = [{type: 'paragraph', content: Array(150).fill('word').join(' ')}];
assert.equal(getReadTimeBreakdown(prose).totalTime, 1);
assert.equal(getReadTimeBreakdown([...prose, {type: 'video', durationSeconds: 61}]).totalTime, 3);
assert.ok(getReadTimeBreakdown([...prose, {type:'carousel', images:Array(10).fill({src:'image',alt:'photo'})}]).mediaTime > getReadTimeBreakdown([...prose, {type:'carousel', images:[{src:'image',alt:'photo'}]}]).mediaTime);
assert.equal(getReadTimeBreakdown([{type:'video'}]).totalTime, 2);
assert.equal(calculateMarkdownReadTime(''), 1);
assert.ok(calculateMarkdownReadTime(prose[0].content + '\n![figure](https://example.com/figure.png)') > calculateMarkdownReadTime(prose[0].content));
console.log(`Verified ${pages.length} pages: canonical policy, internal links, headings, ${figures} described figures, ${contents} contents menus, discovery outputs, and reading estimates.`);
