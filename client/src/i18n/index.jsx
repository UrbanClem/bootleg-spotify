import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import es from './es';

export const DICTS = { en, es };

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' }
];

/** BCP-47 tags used for `Intl` formatting. */
const LOCALES = { en: 'en-US', es: 'es-ES' };

const STORAGE_KEY = 'bootleg.lang';

/**
 * Resolve a dotted key against a dictionary, descending one level per segment.
 * Returns `undefined` rather than throwing so callers can fall back.
 */
function lookup(dict, key) {
  return key.split('.').reduce((node, part) => {
    if (node === null || node === undefined || typeof node !== 'object') return undefined;
    return node[part];
  }, dict);
}

/** Pick the plural branch for `n`. Both shipped languages use 1 / other. */
function resolvePlural(entry, n) {
  if (entry === null || typeof entry !== 'object') return entry;
  const branch = n === 1 ? entry.one : entry.other;
  return branch ?? entry.other ?? entry.one;
}

/** Replace `{name}` placeholders. Unknown placeholders are left in place. */
function interpolate(str, vars) {
  return str.replace(/\{(\w+)\}/g, (match, name) =>
    vars && Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

/**
 * Translate `key` for `lang`, falling back to English and finally to the key
 * itself. Returning the key keeps a missing string visible in the UI instead of
 * rendering an empty element.
 */
export function translate(lang, key, vars) {
  const dict = DICTS[lang] ?? en;
  const n = vars?.n ?? vars?.count;

  let entry = lookup(dict, key);
  if (entry === undefined && lang !== 'en') entry = lookup(en, key);

  entry = resolvePlural(entry, n);
  if (entry === undefined) {
    if (typeof console !== 'undefined') console.warn(`[i18n] missing key: ${key}`);
    return key;
  }

  return interpolate(String(entry), vars);
}

/**
 * Every leaf key in a dictionary, including plural branches. Used by the SSR
 * smoke test to prove `en` and `es` have stayed in sync.
 */
export function flattenKeys(dict, prefix = '') {
  return Object.entries(dict).flatMap(([name, value]) => {
    const path = prefix ? `${prefix}.${name}` : name;
    if (value !== null && typeof value === 'object') return flattenKeys(value, path);
    return [path];
  });
}

/**
 * Parse a value into a Date.
 *
 * A bare `YYYY-MM-DD` is parsed as UTC midnight by `new Date()`, which renders
 * as the previous day in any negative-offset timezone. `fecha_nacimiento` and
 * `fecha_lanzamiento` arrive exactly in that form, so build them as local dates
 * instead.
 */
function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (plain) return new Date(+plain[1], +plain[2] - 1, +plain[3]);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const I18nContext = createContext(null);

/** Stored choice wins, then the browser's preference, then English. */
function detectLanguage() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return 'en';
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private-mode browsers reject writes; the in-memory choice still works.
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // Changing language must not leave stale English text in the document title.
  useEffect(() => {
    document.title = lang === 'es' ? 'Bootleg — Música' : 'Bootleg — Music';
  }, [lang]);

  const setLang = useCallback((next) => {
    if (DICTS[next]) setLangState(next);
  }, []);

  const value = useMemo(() => {
    const locale = LOCALES[lang] ?? 'en-US';
    return {
      lang,
      setLang,
      locale,
      t: (key, vars) => translate(lang, key, vars),
      // Locale-aware number formatting for follower counts, durations, etc.
      n: (num) => new Intl.NumberFormat(locale).format(num),
      date: (value, opts) => {
        const d = parseDate(value);
        if (!d) return '';
        return d.toLocaleDateString(
          locale,
          opts ?? { year: 'numeric', month: 'long', day: 'numeric' }
        );
      }
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
