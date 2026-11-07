import React, { useMemo } from 'react';
import type { EducationalLevel } from '../../data/appTypes';
import { groupLevels } from '../../lib/catalogRules';

/** Admin multi-select: levels grouped into their sections, with simple checkboxes. */
export function LevelPicker({ levels, selected, onChange }: {
  levels: EducationalLevel[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const groups = useMemo(() => groupLevels(levels), [levels]);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (groups.length === 0) {
    return (
      <p className="text-[13px] text-[#B4471C] bg-[#FBEADF] rounded-xl p-3">
        Educational levels could not be loaded. Please make sure the backend has been updated, then refresh this page.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#E4DDCE] max-h-64 overflow-y-auto divide-y divide-[#E4DDCE]">
      {groups.map(g => (
        <fieldset key={g.groupName} className="p-3">
          <legend className="text-[11.5px] font-bold uppercase tracking-wide text-[#55605A] px-1">{g.groupName}</legend>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            {g.levels.map(l => (
              <label key={l.id} className="flex items-center gap-2.5 min-h-[36px] cursor-pointer text-[13.5px] text-[#1B2420]">
                <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} className="w-4 h-4 rounded accent-[#0F5D3C]" />
                {l.name}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
