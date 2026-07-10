/* build-site.mjs - setzt Header + Footer aus EINER Quelle (partials/) idempotent
   per Marker-Kommentar in jede *.html. Garantiert byte-identisches Chrome auf allen
   Seiten (Web-Starter-Kit §2a). Aufruf: node build-site.mjs   Danach deployen.
   partials/ und diese Datei werden NICHT deployed (reine Quellen). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const header = readFileSync(join(ROOT, 'partials/header.html'), 'utf8').trim();
const footer = readFileSync(join(ROOT, 'partials/footer.html'), 'utf8').trim();
const demobar = readFileSync(join(ROOT, 'partials/demobar.html'), 'utf8').trim();

const blocks = {
  header:  { open: '<!-- #chrome:header -->',  close: '<!-- /#chrome:header -->',  html: header },
  demobar: { open: '<!-- #chrome:demobar -->', close: '<!-- /#chrome:demobar -->', html: demobar },
  footer:  { open: '<!-- #chrome:footer -->',  close: '<!-- /#chrome:footer -->',  html: footer },
};

function inject(src) {
  let out = src, changed = false;
  for (const b of Object.values(blocks)) {
    const oi = out.indexOf(b.open);
    const ci = out.indexOf(b.close);
    if (oi === -1 || ci === -1 || ci < oi) continue;
    const before = out.slice(0, oi + b.open.length);
    const after = out.slice(ci);
    const next = before + '\n' + b.html + '\n' + after;
    if (next !== out) { out = next; changed = true; }
  }
  return { out, changed };
}

const files = readdirSync(ROOT).filter(f => f.endsWith('.html'));
let n = 0;
for (const f of files) {
  const p = join(ROOT, f);
  const { out, changed } = inject(readFileSync(p, 'utf8'));
  if (changed) { writeFileSync(p, out, 'utf8'); n++; console.log('  chrome -> ' + f); }
}
console.log(`build-site: ${files.length} Seiten geprüft, ${n} aktualisiert.`);
