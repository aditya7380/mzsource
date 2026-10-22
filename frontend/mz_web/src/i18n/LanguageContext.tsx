/**
 * Frontend-only localization.
 *
 * - English is the default and the fallback for every string.
 * - Strings are written as  t('stable.key', 'English text')  so the English UI
 *   can never break, even if a key is missing from a dictionary.
 * - Mizo (ISO 639-3 "lus") lives in ./lus.ts. A key that has no Mizo entry
 *   falls back to English instead of showing a guess.
 * - No backend, API, auth or storage-contract is touched. The only thing
 *   persisted is the user's language choice in localStorage.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lus } from './lus';

export type Lang = 'en' | 'lus';
export const LANGUAGES: { code: Lang; name: string; htmlLang: string }[] = [
  { code: 'en', name: 'English', htmlLang: 'en' },
  { code: 'lus', name: 'Mizo ṭawng', htmlLang: 'lus' },
];

const STORAGE_KEY = 'mzsource_lang';
const DICTIONARIES: Record<Lang, Record<string, string>> = { en: {}, lus };

function readStoredLang(): Lang {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return v === 'lus' || v === 'en' ? v : 'en';
  } catch {
    return 'en';
  }
}

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** t('key', 'English default') */
  t: (key: string, fallback: string) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? readStoredLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* storage unavailable: keep in-memory choice */ }
  }, []);

  useEffect(() => {
    const meta = LANGUAGES.find(x => x.code === lang);
    if (typeof document !== 'undefined' && meta) document.documentElement.lang = meta.htmlLang;
  }, [lang]);

  const t = useCallback(
    (key: string, fallback: string) => {
      const entry = DICTIONARIES[lang][key];
      return entry && entry.trim() ? entry : fallback;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used within LanguageProvider');
  return ctx;
}
