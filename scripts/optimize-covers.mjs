import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(root, 'covers-src');
const OUT_DIR = path.join(root, 'public/images/covers-opt');

const VARIANTS = [
  { suffix: 'card', width: 640, webpQuality: 78, avifQuality: 48 },
  { suffix: 'hero', width: 1086, webpQuality: 82, avifQuality: 52 },
];

const isPng = (name) => name.toLowerCase().endsWith('.png');

const listPngs = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listPngs(full)));
    else if (entry.isFile() && isPng(entry.name)) files.push(full);
  }
  return files;
};

const isStale = async (src, dest) => {
  try {
    const [srcStat, destStat] = await Promise.all([stat(src), stat(dest)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
};

const encode = async (src) => {
  const stem = path.basename(src, path.extname(src));
  for (const variant of VARIANTS) {
    const webpOut = path.join(OUT_DIR, `${stem}-${variant.suffix}.webp`);
    const avifOut = path.join(OUT_DIR, `${stem}-${variant.suffix}.avif`);
    const pipeline = () =>
      sharp(src)
        .rotate()
        .resize({
          width: variant.width,
          withoutEnlargement: true,
        });

    if (await isStale(src, webpOut)) {
      await pipeline().webp({ quality: variant.webpQuality, effort: 4 }).toFile(webpOut);
      console.log(`  wrote ${path.relative(root, webpOut)}`);
    }

    if (await isStale(src, avifOut)) {
      await pipeline().avif({ quality: variant.avifQuality, effort: 4 }).toFile(avifOut);
      console.log(`  wrote ${path.relative(root, avifOut)}`);
    }
  }
};

const run = async () => {
  const sources = await listPngs(SRC_DIR);
  if (sources.length === 0) {
    throw new Error(`No PNG covers found in ${path.relative(root, SRC_DIR)}`);
  }
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Optimizing ${sources.length} cover posters…`);
  for (const src of sources) {
    await encode(src);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
