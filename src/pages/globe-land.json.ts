import type { APIRoute } from 'astro';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import sharp from 'sharp';
import land50 from 'world-atlas/land-50m.json';
import { GLOBE_DOTS, latticePoint } from '../lib/globe';

// Rasterise the land once onto a plate carrée image, then read one pixel per
// lattice point: far quicker than a point-in-polygon test for each of them.
const WIDTH = 2048, HEIGHT = 1024;

export const GET: APIRoute = async () => {
  const land = feature(land50 as any, (land50 as any).objects.land) as any;
  const projection = geoEquirectangular().scale(WIDTH / (2 * Math.PI)).translate([WIDTH / 2, HEIGHT / 2]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><rect width="100%" height="100%" fill="#fff"/><path d="${geoPath(projection)(land)}" fill="#000"/></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });

  const mask = new Uint8Array(Math.ceil(GLOBE_DOTS / 8));
  for (let index = 0; index < GLOBE_DOTS; index++) {
    const [lon, lat] = latticePoint(index);
    const x = Math.min(WIDTH - 1, Math.floor((lon + 180) / 360 * WIDTH));
    const y = Math.min(HEIGHT - 1, Math.floor((90 - lat) / 180 * HEIGHT));
    if (data[(y * info.width + x) * info.channels] < 128) mask[index >> 3] |= 1 << (index & 7);
  }
  return new Response(JSON.stringify({ dots: GLOBE_DOTS, land: Buffer.from(mask).toString('base64') }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
