const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const ROOT = process.cwd();
const LOCALES = ['pt-BR', 'pt-PT', 'en-US', 'es-ES'];
const cache = new Map();

function loadTsModule(filePath) {
  const normalized = path.resolve(filePath);
  if (cache.has(normalized)) return cache.get(normalized);

  const source = fs.readFileSync(normalized, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
    fileName: normalized,
  }).outputText;

  const module = { exports: {} };
  const dirname = path.dirname(normalized);

  function localRequire(request) {
    if (request.startsWith('.')) {
      const candidate = path.resolve(dirname, request);
      const resolved = fs.existsSync(candidate)
        ? candidate
        : fs.existsSync(`${candidate}.ts`)
          ? `${candidate}.ts`
          : fs.existsSync(path.join(candidate, 'index.ts'))
            ? path.join(candidate, 'index.ts')
            : null;
      if (!resolved) throw new Error(`Cannot resolve module: ${request} from ${normalized}`);
      return loadTsModule(resolved);
    }
    return require(request);
  }

  const context = vm.createContext({
    module,
    exports: module.exports,
    require: localRequire,
    __dirname: dirname,
    __filename: normalized,
    process,
    console,
  });

  vm.runInContext(transpiled, context, { filename: normalized });
  cache.set(normalized, module.exports);
  return module.exports;
}

function flattenKeys(value, prefix = '', result = new Set()) {
  if (value === null || value === undefined) return result;
  if (typeof value !== 'object' || Array.isArray(value)) {
    if (prefix) result.add(prefix);
    return result;
  }
  const keys = Object.keys(value);
  if (keys.length === 0 && prefix) result.add(prefix);
  for (const key of keys) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    flattenKeys(value[key], nextPrefix, result);
  }
  return result;
}

function getLocaleTranslations(locale) {
  const indexFile = path.join(ROOT, 'src', 'i18n', 'locales', locale, 'index.ts');
  const exports = loadTsModule(indexFile);
  const exportKey = Object.keys(exports).find((key) => key.toLowerCase().endsWith('translations'));
  if (!exportKey) throw new Error(`Could not find translations export for locale ${locale}`);
  return exports[exportKey];
}

const localeKeys = {};
for (const locale of LOCALES) {
  const translations = getLocaleTranslations(locale);
  localeKeys[locale] = flattenKeys(translations);
}

const baselineLocale = 'pt-BR';
const baselineKeys = localeKeys[baselineLocale];
const errors = [];

for (const locale of LOCALES) {
  if (locale === baselineLocale) continue;
  const missing = [...baselineKeys].filter((key) => !localeKeys[locale].has(key));
  const extra = [...localeKeys[locale]].filter((key) => !baselineKeys.has(key));
  if (missing.length > 0 || extra.length > 0) {
    errors.push({ locale, missing, extra });
  }
}

if (errors.length > 0) {
  console.log(`i18n key mismatch against ${baselineLocale}:\n`);
  for (const err of errors) {
    console.log(`Locale: ${err.locale}`);
    if (err.missing.length > 0) {
      console.log(`  Missing (${err.missing.length}):`);
      err.missing.slice(0, 80).forEach((key) => console.log(`    - ${key}`));
    }
    if (err.extra.length > 0) {
      console.log(`  Extra (${err.extra.length}):`);
      err.extra.slice(0, 80).forEach((key) => console.log(`    - ${key}`));
    }
  }
  process.exit(1);
}

console.log('All locale keysets are aligned.');
