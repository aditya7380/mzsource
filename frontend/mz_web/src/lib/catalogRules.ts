/**
 * Catalogue rules that decide what buyers (and admin selection lists) are shown.
 * Kept in ONE place so every page follows the same rules.
 */
import type { Category, EducationalLevel, Product } from '../data/appTypes';

/** Categories that have been retired. They are hidden everywhere in the app (their products are not deleted). */
export const RETIRED_CATEGORY_NAMES = ['disposable products', 'disposal products'];

/** The category that carries the educational-level classification. */
export const EDUCATIONAL_CATEGORY_NAME = 'toys & educational';

const norm = (s: string) => s.trim().toLowerCase();

export const isRetiredCategory = (c: Pick<Category, 'name'>) => RETIRED_CATEGORY_NAMES.includes(norm(c.name));
export const isEducationalCategory = (c: Pick<Category, 'name'>) => norm(c.name) === EDUCATIONAL_CATEGORY_NAME;
/** A category buyers may see and admins may choose for a product */
export const isSelectableCategory = (c: Category) => c.active && !isRetiredCategory(c);

/** A product buyers may see: it is active AND its category is still selectable */
export function isBuyerVisibleProduct(p: Product, categories: Category[]): boolean {
  if (!p.active) return false;
  const cat = categories.find(c => c.id === p.categoryId);
  return !!cat && isSelectableCategory(cat);
}

export interface LevelGroup { groupName: string; groupOrder: number; levels: EducationalLevel[] }

/** Groups the flat level list into its sections (A–G), in display order */
export function groupLevels(levels: EducationalLevel[]): LevelGroup[] {
  const map = new Map<string, LevelGroup>();
  for (const l of [...levels].sort((a, b) => a.groupOrder - b.groupOrder || a.sortOrder - b.sortOrder)) {
    if (!map.has(l.groupName)) map.set(l.groupName, { groupName: l.groupName, groupOrder: l.groupOrder, levels: [] });
    map.get(l.groupName)!.levels.push(l);
  }
  return [...map.values()];
}

export const hasLevel = (p: Product, levelId: string) => (p.educationalLevelIds ?? []).includes(levelId);
