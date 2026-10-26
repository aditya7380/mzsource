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

// const call = /\bt\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\)/g;
// const rows = new Map();
// for (const f of files) {
//   const src = readFileSync(f, 'utf8');
//   for (const m of src.matchAll(call)) rows.set(m[1], m[2].replace(/\\'/g, "'"));
// }

const call = /\bt\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\)/g;
const rows = new Map();

for (const f of files) {
  const src = readFileSync(f, 'utf8')
    // Remove block comments and line comments before extracting calls.
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  for (const m of src.matchAll(call)) {
    rows.set(m[1], m[2].replace(/\\'/g, "'"));
  }
}


// Include known keys built dynamically by Landing and BuyerHome.
const dynamicRows = [
  ['landing.step1.title', 'Browse & choose'],
  ['landing.step1.body', 'Explore electronics, robotics and educational materials, then add what you need to your request cart.'],
  ['landing.step2.title', 'Send your request'],
  ['landing.step2.body', 'Confirm your delivery address and submit. No online payment is taken at this stage.'],
  ['landing.step3.title', 'Receive a quotation'],
  ['landing.step3.body', 'Our team checks availability and sourcing, then sends you a quotation to review.'],
  ['landing.step4.title', 'Confirm & track'],
  ['landing.step4.body', 'Confirm the quotation and follow your request from Pending through to Completed.'],
  ['home.f1', 'Verified Sourcing'],
  ['home.f2', 'Request Tracking'],
  ['home.f3', 'Quotation First'],
  ['home.f4', 'Local Support'],
  ['nav.home', 'Home'],
  ['nav.categories', 'Categories'],
  ['nav.requests', 'Requests'],
];
for (const [key, english] of dynamicRows) {
  if (!rows.has(key)) rows.set(key, english);
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
