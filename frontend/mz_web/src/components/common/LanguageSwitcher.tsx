import React from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGES, useT } from '../../i18n/LanguageContext';
import type { Lang } from '../../i18n/LanguageContext';

/**
 * Accessible segmented language control (English default, Mizo optional).
 * Uses a radiogroup so it is operable with arrow keys and announces state.
 */
export function LanguageSwitcher({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const { lang, setLang, t } = useT();
  const light = tone === 'light';

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const i = LANGUAGES.findIndex(l => l.code === lang);
    const next = LANGUAGES[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : LANGUAGES.length - 1)) % LANGUAGES.length];
    setLang(next.code);
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('lang.label', 'Language')}
      onKeyDown={onKey}
      className={`inline-flex items-center gap-1 rounded-full p-1 border ${
        light ? 'border-white/30 bg-white/10' : 'border-line bg-white'
      } ${className}`}
    >
      <Languages className={`w-3.5 h-3.5 ml-1.5 flex-shrink-0 ${light ? 'text-white/80' : 'text-muted'}`} aria-hidden="true" />
      {LANGUAGES.map(l => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            lang={l.htmlLang}
            onClick={() => setLang(l.code as Lang)}
            className={`h-8 px-3 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
              active
                ? light ? 'bg-white text-primary-deep' : 'bg-primary text-white'
                : light ? 'text-white/85 hover:bg-white/15' : 'text-muted hover:bg-primary-tint'
            }`}
          >
            {l.name}
          </button>
        );
      })}
    </div>
  );
}
