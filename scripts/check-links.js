#!/usr/bin/env node
// Checks all internal links in the built site for 404s.
// Run after `npm run build`.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST_DIR = path.resolve(__dirname, '../dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}

function walkDir(dir) {
  return fs.readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory() ? walkDir(full) : [full];
  });
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) hrefs.push(m[1]);
  return hrefs;
}

function internalLinkExists(href) {
  const [pathname] = href.split('#');
  if (!pathname) return true; // anchor-only, skip

  const candidates = [
    path.join(DIST_DIR, pathname),
    path.join(DIST_DIR, pathname, 'index.html'),
    path.join(DIST_DIR, pathname.replace(/\/$/, ''), 'index.html'),
  ];

  return candidates.some(p => fs.existsSync(p) && fs.statSync(p).isFile());
}

const htmlFiles = walkDir(DIST_DIR).filter(f => f.endsWith('.html'));
const broken = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const page = path.relative(DIST_DIR, file);

  for (const href of extractHrefs(html)) {
    if (
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('#') ||
      href.startsWith('/sw-api/')
    ) continue;

    if (!internalLinkExists(href)) {
      broken.push({ page, href });
    }
  }
}

if (broken.length > 0) {
  console.error(`\n❌ ${broken.length} broken link(s) found:\n`);
  for (const { page, href } of broken) {
    console.error(`  ${page}\n    → ${href}\n`);
  }
  process.exit(1);
}

console.log(`✅ All internal links OK (${htmlFiles.length} pages checked)`);
