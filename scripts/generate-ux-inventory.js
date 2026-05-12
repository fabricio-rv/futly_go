const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGETS = ['app', 'src'];
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'ux-inventory.json');

const EXTS = new Set(['.ts', '.tsx']);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
      continue;
    }
    if (EXTS.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

function getLineCount(content, pattern) {
  const lines = content.split(/\r?\n/);
  const matches = [];
  lines.forEach((line, idx) => {
    if (pattern.test(line)) matches.push(idx + 1);
  });
  return matches;
}

function extractUiLiterals(content) {
  const literals = [];
  const jsxText = content.matchAll(/>([^<>{][^<>{]*[A-Za-zÀ-ÿ][^<>{]*)</g);
  for (const match of jsxText) {
    const value = String(match[1] || '').trim();
    if (!value || value.length < 3) continue;
    literals.push(value);
  }
  const props = content.matchAll(/\b(label|placeholder|title|subtitle|message)\s*=\s*["'`]([^"'`]+)["'`]/g);
  for (const match of props) {
    const value = String(match[2] || '').trim();
    if (!value || value.length < 3) continue;
    literals.push(value);
  }
  return Array.from(new Set(literals));
}

function buildInventory(files) {
  const inventory = {
    generatedAt: new Date().toISOString(),
    totals: {
      files: files.length,
      screens: 0,
      asyncCalls: 0,
      feedbackPoints: 0,
      hardcodedUiTexts: 0,
    },
    files: [],
  };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const isScreen = rel.startsWith('app/') && rel.endsWith('.tsx');
    const asyncLines = getLineCount(content, /\bawait\b|useEffect\(|useFocusEffect\(/);
    const feedbackLines = getLineCount(content, /Alert\.alert\(|showToast\(|toast\.(success|error|warning|info)\(/);
    const uiLiterals = extractUiLiterals(content);

    if (isScreen) inventory.totals.screens += 1;
    inventory.totals.asyncCalls += asyncLines.length;
    inventory.totals.feedbackPoints += feedbackLines.length;
    inventory.totals.hardcodedUiTexts += uiLiterals.length;

    inventory.files.push({
      file: rel,
      isScreen,
      asyncLineCount: asyncLines.length,
      asyncLines,
      feedbackLineCount: feedbackLines.length,
      feedbackLines,
      hardcodedUiTextCount: uiLiterals.length,
      hardcodedUiTexts: uiLiterals,
    });
  }

  return inventory;
}

const allFiles = TARGETS.flatMap((target) => walk(path.join(ROOT, target)));
const inventory = buildInventory(allFiles);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(inventory, null, 2), 'utf8');

console.log(`Inventory generated: ${path.relative(ROOT, OUT_FILE)}`);
console.log(`Screens: ${inventory.totals.screens}`);
console.log(`Async points: ${inventory.totals.asyncCalls}`);
console.log(`Feedback points: ${inventory.totals.feedbackPoints}`);
console.log(`Hardcoded UI texts: ${inventory.totals.hardcodedUiTexts}`);
