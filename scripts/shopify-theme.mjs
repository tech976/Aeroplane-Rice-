// Builds the Shopify theme into dist-shopify/: the Liquid files from shopify/, the app from src/,
// and the files from public/assets. Shopify keeps theme assets in one flat folder, so
// public/assets/img/field.webp is copied as assets/img-field.webp (src/host.ts maps the paths the
// same way). The investor filings stay on the main site: at 340 MB they are far beyond a theme.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = 'dist-shopify';
const SKIP = ['investors'];
const LARGEST = 10 * 1024 * 1024; // larger files belong in Shopify Files, not the theme

rmSync(OUT, { recursive: true, force: true });
cpSync('shopify', OUT, { recursive: true, filter: (path) => !path.endsWith('.csv') });

execSync('npx vite build --mode shopify', { stdio: 'inherit' });

// the stylesheet points at /assets/...; in the theme its neighbours sit beside it, renamed
const stamp = Date.now().toString(36);
const css = join(OUT, 'assets', 'aeroplane.css');
writeFileSync(css, readFileSync(css, 'utf8').replace(
  /url\((["']?)\/assets\/([^"')]+)\1\)/g,
  (_, quote, path) => `url(${quote}${path.replaceAll('/', '-')}?v=${stamp}${quote})`,
));

const copied = new Map();
const skipped = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const inner = relative('public/assets', path);
    if (statSync(path).isDirectory()) {
      if (!SKIP.includes(inner)) walk(path);
      continue;
    }
    if (name.startsWith('.')) continue;
    if (statSync(path).size > LARGEST) { skipped.push(inner); continue; }
    const flat = inner.split(/[\\/]/).join('-');
    if (copied.has(flat)) throw new Error(`${inner} and ${copied.get(flat)} would both become assets/${flat}`);
    if (existsSync(join(OUT, 'assets', flat))) throw new Error(`${inner} would overwrite the built assets/${flat}`);
    copied.set(flat, inner);
    cpSync(path, join(OUT, 'assets', flat));
  }
})('public/assets');

console.log(`\nshopify: theme written to ${OUT}/ with ${copied.size} files from public/assets`);
if (skipped.length) console.log(`shopify: left out, over ${LARGEST / 1024 / 1024} MB: ${skipped.join(', ')}`);
