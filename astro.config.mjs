import { defineConfig } from 'astro/config';
import { SITE_ORIGIN } from './src/lib/siteConfig.mjs';

export default defineConfig({
  site: SITE_ORIGIN,
});
