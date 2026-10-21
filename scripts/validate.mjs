/**
 * 網站靜態檢查（在 GitHub Actions 的 Node.js 環境執行）
 *
 * 1. 掃出所有 HTML 的相對連結，確認目標檔案存在
 * 2. 檢查容器標籤開闔是否配對
 *
 * 任一項失敗即 exit 1，CI 會標紅。
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const root = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', '.github']);
const CONTAINERS = ['div', 'section', 'form', 'article', 'aside', 'main'];

let errors = 0;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = walk(root).sort();
console.log(`Found ${pages.length} HTML page(s)\n`);

for (const page of pages) {
  const rel = relative(root, page);
  const html = readFileSync(page, 'utf8');
  let pageErrors = 0;

  // ── 相對連結 ──────────────────────────────────────────────
  const links = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(u));

  for (const link of new Set(links)) {
    const target = resolve(dirname(page), link.split('?')[0]);
    if (!existsSync(target)) {
      console.error(`  ✗ MISSING     ${rel}  ->  ${link}`);
      errors++;
      pageErrors++;
    }
  }

  // ── 標籤配對 ──────────────────────────────────────────────
  for (const tag of CONTAINERS) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) {
      console.error(`  ✗ UNBALANCED  ${rel}  <${tag}>  ${open} open / ${close} close`);
      errors++;
      pageErrors++;
    }
  }

  if (pageErrors === 0) console.log(`  ✓ ${rel}`);
}

console.log('');

if (errors > 0) {
  console.error(`${errors} problem(s) found`);
  process.exit(1);
}

console.log('All checks passed.');
