// Builds the demo and captures each scene to website/public/screenshots/<scene>.png with headless Chrome.
// Usage: node demo/shoot.mjs   (set CHROME to your Chrome/Chromium binary if it isn't in the default macOS location)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const esbuild = resolve('website/node_modules/.bin/esbuild');
const outDir = resolve('website/public/screenshots');

execFileSync(esbuild, [
  'demo/demo.tsx', '--bundle', '--format=iife', '--outfile=demo/demo.js',
  '--jsx=automatic', '--jsx-import-source=preact', '--log-level=warning',
], { stdio: 'inherit' });

// Read scene sizes from the source so there's one list of scenes.
const source = readFileSync('demo/demo.tsx', 'utf8');
const scenes = [...source.matchAll(/'([a-z-]+)': \{ width: (\d+), height: (\d+)|'([a-z-]+)': \{\n\s+width: (\d+),\n\s+height: (\d+)/g)].map((m) => ({
  name: m[1] ?? m[4],
  width: Number(m[2] ?? m[5]),
  height: Number(m[3] ?? m[6]),
}));

mkdirSync(outDir, { recursive: true });
const page = pathToFileURL(resolve('demo/index.html')).href;
for (const { name, width, height } of scenes) {
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2',
    `--window-size=${width},${height}`, '--virtual-time-budget=1500',
    `--screenshot=${resolve(outDir, `${name}.png`)}`, `${page}?scene=${name}`,
  ], { stdio: 'ignore' });
  console.log(`${name}.png  ${width}×${height}`);
}
