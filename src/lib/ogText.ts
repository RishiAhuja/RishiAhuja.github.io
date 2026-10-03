import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { create, type Font } from 'fontkit';
import sharp from 'sharp';

export type TextStyle = {
  size: number;
  minSize?: number;
  width: number;
  height: number;
  color?: string;
  face?: 'Regular' | 'RegularItalic' | 'Medium';
};

const fonts = new Map<string, Promise<Font>>();
function loadFont(root: string, face: NonNullable<TextStyle['face']>) {
  const path = join(root, `public/fonts/athletics/Athletics-${face}.otf`);
  if (!fonts.has(path)) fonts.set(path, readFile(path).then((buffer) => {
    const font = create(buffer);
    if (!('layout' in font)) throw new Error(`Expected a single Athletics font: ${path}`);
    return font;
  }));
  return fonts.get(path)!;
}

function wrapText(value: string, font: Font, size: number, width: number) {
  const fits = (text: string) => {
    const run = font.layout(text);
    return Math.max(run.advanceWidth, run.bbox.maxX) * size / font.unitsPerEm <= width - 2;
  };
  const lines: string[] = [];
  for (const paragraph of value.split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (fits(candidate)) { line = candidate; continue; }
      if (line) lines.push(line);
      line = '';
      for (const character of word) {
        if (line && !fits(line + character)) { lines.push(line); line = ''; }
        line += character;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

async function renderText(value: string, font: Font, size: number, style: TextStyle) {
  const lines = wrapText(value, font, size, style.width);
  const runs = lines.map((line) => font.layout(line));
  const scale = size / font.unitsPerEm;
  const lineHeight = size * 1.18;
  const left = Math.min(0, ...runs.map((run) => run.bbox.minX * scale));
  const top = Math.min(...runs.map((run, index) => index * lineHeight - run.bbox.maxY * scale));
  const right = Math.max(...runs.map((run) => Math.max(run.advanceWidth, run.bbox.maxX) * scale));
  const bottom = Math.max(...runs.map((run, index) => index * lineHeight - run.bbox.minY * scale));
  const width = Math.max(1, Math.ceil(right - left) + 1);
  const height = Math.max(1, Math.ceil(bottom - top) + 1);
  const paths = runs.flatMap((run, line) => {
    let x = 0;
    return run.glyphs.map((glyph, index) => {
      const position = run.positions[index];
      const path = `<path d="${glyph.path.toSVG()}" transform="translate(${(x + position.xOffset) * scale - left} ${line * lineHeight - position.yOffset * scale - top}) scale(${scale} ${-scale})"/>`;
      x += position.xAdvance;
      return path;
    });
  }).join('');
  // Actual glyph outlines avoid system-font substitution and produce the same
  // Athletics typography on macOS previews and Linux/GitHub Pages builds.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="${style.color || '#353535'}">${paths}</g></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer({ resolveWithObject: true });
}

export async function textImage(value: string, style: TextStyle, root: string) {
  const font = await loadFont(root, style.face || 'Regular');
  const minSize = style.minSize || style.size;
  const render = (text: string, size: number) => renderText(text, font, size, style);
  const fits = (result: { info: { width: number; height: number } }) =>
    result.info.height <= style.height && result.info.width <= style.width;
  for (let size = style.size; size >= minSize; size -= 2) {
    const result = await render(value, size);
    if (fits(result)) return result;
  }

  // Keep future, unusually long titles readable without clipping the footer.
  const words = value.trim().split(/\s+/);
  while (words.length > 1) {
    words.pop();
    const result = await render(`${words.join(' ')}…`, minSize);
    if (fits(result)) return result;
  }
  let shortened = words[0] || '…';
  while (shortened.length > 1) {
    shortened = shortened.slice(0, -1);
    const result = await render(`${shortened}…`, minSize);
    if (fits(result)) return result;
  }
  return render('…', minSize);
}
