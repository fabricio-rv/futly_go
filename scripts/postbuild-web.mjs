import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve(process.cwd(), 'dist', 'index.html');
let html = readFileSync(indexPath, 'utf8');

const injection = [
  '<meta name="application-name" content="Futly GO">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Futly GO">',
  '<link rel="manifest" href="/manifest.json">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png">',
].join('');

if (!html.includes('apple-mobile-web-app-title')) {
  html = html.replace('</head>', `${injection}</head>`);
}

html = html.replace('<html lang="en">', '<html lang="pt-BR">');
writeFileSync(indexPath, html, 'utf8');
