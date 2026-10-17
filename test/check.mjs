// Quick checks without a browser: the game's script parses, the manifest is valid JSON,
// and every file the service worker saves for offline use exists.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
let failed = false;
const ok = msg => console.log('ok   ' + msg);
const bad = msg => { console.log('FAIL ' + msg); failed = true; };

// 1. The script inside index.html parses
const html = readFileSync(root + 'index.html', 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
mkdirSync(root + 'test/out', { recursive: true });
writeFileSync(root + 'test/out/game.js', js);
try { execFileSync(process.execPath, ['--check', root + 'test/out/game.js'], { stdio: 'pipe' }); ok('index.html script parses'); }
catch (e) { bad('index.html script: ' + e.stderr.toString()); }

// 2. The manifest is valid and its icons exist
try {
  const m = JSON.parse(readFileSync(root + 'manifest.webmanifest', 'utf8'));
  ok('manifest is valid JSON');
  for (const i of m.icons) existsSync(root + i.src) ? ok('icon ' + i.src) : bad('missing icon ' + i.src);
} catch (e) { bad('manifest: ' + e.message); }

// 3. Every file in sw.js FILES exists
const sw = readFileSync(root + 'sw.js', 'utf8');
const files = JSON.parse(sw.match(/const FILES = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
for (const f of files) {
  const p = f === './' ? 'index.html' : f.replace('./', '');
  existsSync(root + p) ? ok('sw.js file ' + f) : bad('sw.js lists a missing file: ' + f);
}

// 4. Files the page links to exist
for (const [, href] of html.matchAll(/(?:href|src)="([^":]+)"/g)) existsSync(root + href) ? ok('linked ' + href) : bad('index.html links a missing file: ' + href);

process.exit(failed ? 1 : 0);
