import React, { useMemo } from 'react';
import type { EducationalLevel, Product } from '../../data/appTypes';
import { groupLevels, hasLevel } from '../../lib/catalogRules';
import { useT } from '../../i18n/LanguageContext';

/**
 * Buyer-facing "Browse by educational level": one clearly separate section per group
 * (Early Learning, Middle School, ...), each with its levels as selectable chips.
 */
export function LevelBrowser({ levels, products, selectedId, onSelect }: {
  levels: EducationalLevel[];
  products: Product[];
  selectedId: string;
  onSelect: (levelId: string) => void;
}) {
  const { t } = useT();
  const groups = useMemo(() => groupLevels(levels), [levels]);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of levels) m[l.id] = products.filter(p => hasLevel(p, l.id)).length;
    return m;
  }, [levels, products]);

  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="level-browser-title" className="mb-7">
      <h2 id="level-browser-title" className="text-[17px] font-bold text-[#1B2420]">{t('level.title', 'Browse by educational level')}</h2>
      <p className="text-[13.5px] text-[#55605A] mt-1 mb-4">{t('level.sub', 'Find products and project kits for a specific class or programme.')}</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((g, i) => (
          <section key={g.groupName} aria-labelledby={`level-group-${i}`} className="rounded-2xl bg-white border border-[#E4DDCE] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-[#E6F2EA] text-[#0F5D3C] text-[12.5px] font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <h3 id={`level-group-${i}`} className="text-[14.5px] font-bold text-[#1B2420] leading-tight">{g.groupName}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.levels.map(l => {
                const active = selectedId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(active ? '' : l.id)}
                    className={`min-h-[36px] px-3 rounded-full text-[13px] font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                      active ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#1B2420] border-[#E4DDCE] hover:bg-[#E6F2EA]'
                    }`}
                  >
                    {l.name}
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-bold flex items-center justify-center ${active ? 'bg-white/25 text-white' : 'bg-[#E6F2EA] text-[#0F5D3C]'}`}>
                      {counts[l.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
