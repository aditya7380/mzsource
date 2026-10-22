/**
 * Mizo (lus) dictionary — INTENTIONALLY MINIMAL.
 *
 * Only the language's own name is filled in, because that is the one string
 * that is certain. Every other key is left out on purpose: a missing key falls
 * back to the English text, which is safer than shipping unverified Mizo.
 *
 * HOW TO COMPLETE THIS (needs a fluent Mizo speaker):
 *   1. npm run i18n:extract         -> writes src/i18n/MIZO_TRANSLATION_REVIEW.csv
 *   2. Have a Mizo speaker fill the "mizo" column of that CSV.
 *   3. Copy each reviewed row here as   'key': 'Mizo text',
 *   Nothing else in the app needs to change.
 *
 * Mizo orthography notes for the reviewer: ṭ / ṭh, and circumflex vowels
 * (â ê î ô û) must be preserved exactly; the UI fonts support them.
 */
export const lus: Record<string, string> = {
  'lang.english': 'English',
  'lang.mizo': 'Mizo ṭawng',
};
