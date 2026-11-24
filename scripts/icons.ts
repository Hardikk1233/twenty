// Generates the app icons from one vector mark: "20" over a double rule, the accounting sign
// for a total. Run with `npm run icons` after changing the design; the PNGs are committed.
//
// - icon-192/512: rounded square, for browsers and the Android splash screen
// - icon-maskable-512: full bleed, mark inside the central safe zone, for Android launchers
// - apple-touch-icon: full bleed 180px; iOS rounds the corners itself

import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const INK = '#14171A';
const PAPER = '#FBFBFA';

// Digits are strokes, not text, so the icon renders the same without any fonts installed.
const mark = `
  <g transform="translate(0 5)">
    <g fill="none" stroke="${PAPER}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
      <path d="M140 182 A49 49 0 1 1 231.4 206.5 L140 316 H238" />
      <rect x="273" y="133" width="99" height="183" rx="49.5" />
    </g>
    <path d="M140 356 H372 M140 380 H372" stroke="${PAPER}" stroke-width="12" />
  </g>`;

const svg = (rounded: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">` +
  `<rect width="512" height="512"${rounded ? ' rx="112"' : ''} fill="${INK}" />${mark}</svg>`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/favicon.svg', svg(true));

const render = (rounded: boolean, size: number, file: string) =>
  sharp(Buffer.from(svg(rounded)), { density: 144 }).resize(size, size).png({ compressionLevel: 9 }).toFile(file);

await render(true, 192, 'public/icons/icon-192.png');
await render(true, 512, 'public/icons/icon-512.png');
await render(false, 512, 'public/icons/icon-maskable-512.png');
await render(false, 180, 'public/apple-touch-icon.png');
console.log('Icons written to public/');
