// Collects every t('key', 'English') call and writes a CSV for a Mizo reviewer.
// Usage: npm run i18n:extract
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(f) && files.push(p);
  }
})(root);

const call = /\bt\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\)/g;
const rows = new Map();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(call)) rows.set(m[1], m[2].replace(/\\'/g, "'"));
}

const lusSrc = readFileSync(join(root, 'i18n', 'lus.ts'), 'utf8');
const done = new Map([...lusSrc.matchAll(/'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)].map(m => [m[1], m[2]]));

const esc = s => `"${String(s).replace(/"/g, '""')}"`;
const out = ['key,english,mizo,status'];
for (const [k, en] of [...rows].sort()) {
  const mz = done.get(k) ?? '';
  out.push([esc(k), esc(en), esc(mz), mz ? 'filled - verify' : 'NEEDS TRANSLATION'].join(','));
}
writeFileSync(join(root, 'i18n', 'MIZO_TRANSLATION_REVIEW.csv'), out.join('\n') + '\n');
console.log(`Wrote ${rows.size} strings (${[...rows.keys()].filter(k => done.has(k)).length} filled).`);
