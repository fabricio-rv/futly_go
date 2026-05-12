const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGETS = ['app', 'src'];
const EXTS = new Set(['.ts', '.tsx']);
const IGNORE_PATH_PARTS = [
  '/i18n/locales/',
  '/i18n/README',
  '/i18n/EXAMPLES',
  '/i18n/IMPLEMENTATION',
  '/components/ui/FormExamples',
  '/features/email/',
  '/contexts/',
  '/lib/',
  '/i18n/hooks/',
  '/services/',
  '/_future/',
  '/app/+html.tsx',
  'app/+html.tsx',
];

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

function shouldIgnore(rel) {
  return IGNORE_PATH_PARTS.some((part) => rel.includes(part));
}

function extractPropLiteral(line) {
  const match = line.match(/\b(placeholder|label|title|subtitle|message|accessibilityLabel)\s*=\s*['"`]([^'"`{]+)['"`]/);
  if (!match) return null;
  return { prop: match[1], literal: match[2] };
}

function hasAlphabeticText(text) {
  return /[A-Za-zÀ-ÿ]/.test(text);
}

function findHardcoded(content) {
  const issues = [];
  const lines = content.split(/\r?\n/);
  const textNodeRegex = /<([A-Za-z][\w.]*)[^>]*>\s*([^<>{]+?)\s*<\/\1>/;
  const alertRegex = /Alert\.alert\(\s*['"`]/;
  const allowedLiteralValues = new Set(['Google', 'Apple', 'HOST', 'Futly Go']);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) return;
    if (trimmed.includes('t(') || trimmed.includes('useTranslation(')) return;

    const textNodeMatch = trimmed.match(textNodeRegex);
    if (textNodeMatch) {
      const value = textNodeMatch[2].trim();
      if (hasAlphabeticText(value)) {
        issues.push({ line: idx + 1, content: trimmed.slice(0, 220) });
        return;
      }
    }

    const propMatch = extractPropLiteral(trimmed);
    if (propMatch) {
      const literal = propMatch.literal.trim();
      if (allowedLiteralValues.has(literal)) return;
      if (hasAlphabeticText(literal)) {
        issues.push({ line: idx + 1, content: trimmed.slice(0, 220) });
        return;
      }
    }

    if (alertRegex.test(trimmed)) {
      issues.push({ line: idx + 1, content: trimmed.slice(0, 220) });
    }
  });

  return issues;
}

const files = TARGETS.flatMap((target) => walk(path.join(ROOT, target)));
const report = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (shouldIgnore(rel)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const issues = findHardcoded(content);
  if (issues.length > 0) report.push({ file: rel, issues });
}

if (report.length > 0) {
  console.log('Hardcoded UI strings detected:\n');
  report.slice(0, 80).forEach((entry) => {
    console.log(`- ${entry.file}`);
    entry.issues.slice(0, 12).forEach((issue) => {
      console.log(`  L${issue.line}: ${issue.content}`);
    });
  });
  console.log(`\nTotal files with issues: ${report.length}`);
  process.exit(1);
}

console.log('No hardcoded UI strings detected.');
