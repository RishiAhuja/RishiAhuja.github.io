import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import { OG_HEIGHT, OG_WIDTH, type OgCard } from './og';
import { textImage, type TextStyle } from './ogText';

// Read the actual site tokens, so changing a cover color also changes its OG card.
async function palette(root: string) {
  const css = await readFile(join(root, 'src/styles/site.css'), 'utf8');
  const tokens = Object.fromEntries(
    [...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map((match) => [match[1], match[2]]),
  );
  return tokens;
}

export async function renderOgImage(card: OgCard, site: URL): Promise<Buffer> {
  // Astro bundles server modules into dist; source assets stay relative to the
  // project root, not to the generated chunk's import.meta.url.
  const root = process.cwd();
  const colors = await palette(root);
  const ink = colors.text || '#353535';
  const muted = colors['text-muted'] || '#666667';
  const cover = colors[`cover-${card.cover}`] || colors['bg-soft'] || '#f6f6f6';
  const background = card.kind === 'writing' || (card.kind === 'blurb' && card.cover) ? cover
    : card.kind === 'research' ? colors['bg-soft'] || '#f6f6f6' : '#ffffff';
  const layers: OverlayOptions[] = [];
  const margin = 64;
  const hasArtwork = Boolean(card.artwork);
  const width = hasArtwork ? 664 : 1072;

  const addText = async (value: string, left: number, top: number, style: TextStyle) => {
    if (!value.trim()) return 0;
    const result = await textImage(value, { color: ink, ...style }, root);
    layers.push({ input: result.data, left, top });
    return result.info.height;
  };

  if (hasArtwork) {
    if (card.kind === 'home') {
      const portrait = await sharp(join(root, 'public', card.artwork!.slice(1)))
        .resize(316, 398, { fit: 'cover', position: 'attention' }).png().toBuffer();
      layers.push({ input: portrait, left: 820, top: 86 });
    } else {
      // The site's framed 3:4 abstract posters, with the same pastel backing.
      layers.push({ input: Buffer.from(
        `<svg width="1200" height="630"><rect x="792" y="58" width="344" height="462" fill="${cover}"/>` +
        '<rect x="829" y="102" width="276" height="368" fill="#000" opacity=".06"/>' +
        '<rect x="827" y="100" width="276" height="368" fill="#000" opacity=".04"/></svg>',
      ), left: 0, top: 0 });
      const artwork = await sharp(join(root, 'public', card.artwork!.slice(1)))
        .resize(276, 368, { fit: 'cover' }).png().toBuffer();
      layers.push({ input: artwork, left: 826, top: 96 });
    }
  }

  await addText(card.eyebrow.toUpperCase(), margin, 62, {
    size: 20, width, height: 28, color: muted,
  });

  if (card.kind === 'home') {
    await addText(card.title, margin, 148, { size: 82, width, height: 104 });
    await addText(card.subtitle, margin, 272, { size: 32, width, height: 46 });
    await addText('Trustworthy AI evaluation, temporal retrieval, and conversational fraud detection.', margin, 344, {
      size: 30, width: 630, height: 124, face: 'RegularItalic', color: muted,
    });
  } else if (card.kind === 'research' || card.kind === 'index') {
    const titleHeight = await addText(card.title, margin, 138, {
      size: card.kind === 'index' ? 82 : 64, minSize: 48, width, height: 154,
    });
    const subtitleTop = 138 + titleHeight + 30;
    const subtitleHeight = await addText(card.subtitle, margin, subtitleTop, {
      size: card.kind === 'index' ? 32 : 34, minSize: 28, width,
      height: Math.min(176, 442 - subtitleTop),
    });
    if (card.badge) {
      const badge = await textImage(card.badge, {
        size: 19, minSize: 17, width: width - 26, height: 26, color: ink,
      }, root);
      const badgeTop = Math.min(subtitleTop + subtitleHeight + 26, 442);
      const badgeBackground = await sharp({ create: {
        width: badge.info.width + 26, height: 40, channels: 4, background: cover,
      } }).png().toBuffer();
      layers.push({ input: badgeBackground, left: margin, top: badgeTop });
      layers.push({ input: badge.data, left: margin + 13, top: badgeTop + 8 });
    }
  } else {
    const titleHeight = await addText(card.title, margin, 134, {
      size: card.kind === 'blurb' ? 64 : 56, minSize: 42, width,
      height: card.kind === 'blurb' ? 234 : 226, face: 'Medium',
    });
    const subtitleTop = 134 + titleHeight + 28;
    await addText(card.subtitle, margin, subtitleTop, {
      size: card.kind === 'blurb' ? 28 : 24, minSize: 22, width,
      height: Math.min(card.kind === 'blurb' ? 112 : 102, 482 - subtitleTop),
      color: muted,
    });
  }

  await addText(card.metadata.toUpperCase(), margin, 496, {
    size: 18, minSize: 16, width, height: 42, color: muted,
  });
  layers.push({ input: Buffer.from(
    `<svg width="1200" height="630"><path d="M64 558H1136" stroke="${colors.rule || '#e6e6e6'}"/></svg>`,
  ), left: 0, top: 0 });
  await addText(card.author || 'Rishi Ahuja', margin, 582, {
    size: 21, width: 550, height: 28,
  });
  const hostname = await textImage(site.hostname, { size: 18, width: 450, height: 28, color: muted }, root);
  layers.push({ input: hostname.data, left: OG_WIDTH - margin - hostname.info.width, top: 584 });

  return sharp({ create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background } })
    .composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
