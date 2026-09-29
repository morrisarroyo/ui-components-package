/**
 * Captures one screenshot per documented component state from the built
 * Storybook, into docs/states/. The README's state tables embed these.
 *
 *   npm run capture-states --workspace ui
 *
 * Interaction states (hover, focus) have no story of their own: they are
 * produced here by hovering or tabbing to the element in its base story.
 */
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = join(root, 'storybook-static');
const outDir = join(root, 'docs', 'states');

/** [file name, story id, interaction] — one row per state in the README. */
const STATES = [
  ['button-primary', 'components-button--primary'],
  ['button-primary-hover', 'components-button--primary', 'hover'],
  ['button-primary-focus', 'components-button--primary', 'tab'],
  ['button-secondary', 'components-button--secondary'],
  ['button-secondary-hover', 'components-button--secondary', 'hover'],
  ['button-small', 'components-button--small'],
  ['button-loading', 'components-button--loading'],
  ['button-disabled', 'components-button--disabled'],
  ['textfield-default', 'components-textfield--default'],
  ['textfield-focus', 'components-textfield--default', 'tab'],
  ['textfield-helper', 'components-textfield--with-helper-text'],
  ['textfield-error', 'components-textfield--with-error'],
  ['textfield-disabled', 'components-textfield--disabled'],
  ['card-body-only', 'components-card--default'],
  ['card-title', 'components-card--with-title'],
  ['card-title-actions', 'components-card--with-title-and-actions'],
  ['table-default', 'components-table--default'],
  ['table-row-hover', 'components-table--clickable-rows', 'hover-row'],
  ['table-row-focus', 'components-table--clickable-rows', 'tab'],
  ['table-empty', 'components-table--empty'],
  ['descriptionlist-default', 'components-descriptionlist--default'],
  ['descriptionlist-missing', 'components-descriptionlist--missing-values'],
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

if (!existsSync(staticDir)) {
  console.error('capture-states: build Storybook first (npm run build-storybook --workspace ui)');
  process.exit(1);
}

const server = createServer((req, res) => {
  const path = join(staticDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 560, height: 400 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });

for (const [name, id, interaction] of STATES) {
  await page.goto(`http://localhost:${port}/iframe.html?id=${id}&viewMode=story`);
  const story = page.locator('#storybook-root > *').first();
  await story.waitFor();
  if (interaction === 'hover') await page.locator('#storybook-root button').first().hover();
  if (interaction === 'hover-row') await page.locator('#storybook-root tbody tr').nth(1).hover();
  if (interaction === 'tab') await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  // Pad the box so focus rings drawn outside the element are not cropped.
  const box = await story.boundingBox();
  const pad = 8;
  await page.screenshot({
    path: join(outDir, `${name}.png`),
    clip: { x: Math.max(box.x - pad, 0), y: Math.max(box.y - pad, 0), width: box.width + pad * 2, height: box.height + pad * 2 },
  });
  console.log(`captured docs/states/${name}.png`);
}

await browser.close();
server.close();
