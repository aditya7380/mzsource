# MZ Source — frontend redesign notes

Scope: **frontend only.** No backend file, API route, schema, auth flow, dependency or
environment value was changed. `src/lib/api.ts`, `src/context/AppContext.tsx`,
`src/context/CheckoutContext.tsx`, `src/data/appTypes.ts`, `src/lib/format.ts`,
`src/main.tsx`, `package-lock.json` are byte-identical to the originals. All routes,
form fields, field names and payloads are unchanged.

## What changed

**Design system** (`src/index.css`): Tailwind v4 tokens for a Mizoram-hills palette —
forest `#0F5D3C`, deep forest `#0A4429`, ivory canvas `#FAF7F0`, charcoal ink `#1B2420`,
muted `#55605A`, one terracotta accent `#B4471C`. Headings use Fraunces, body Inter
(both render Mizo letters such as ṭ, â, ê, î, ô, û). Global visible focus ring,
skip link, `prefers-reduced-motion` support. Old orange accent (2.2:1 with white text)
replaced by one at 5.4:1; muted/placeholder greys darkened to pass AA.

**Palette applied everywhere**: 26 pages/components were re-coloured only. Status colours
(`getStatusColor` in `data/appTypes.ts`) were intentionally left alone so status meaning
does not change.

**Brand + imagery** (`components/brand/Brand.tsx`): original SVG logo mark, layered misty
hills with faint circuit traces, and a generic woven-stripe divider. The divider is
textile-*inspired* geometry only — it does not reproduce any specific traditional Mizo
pattern, and no cultural claims are made anywhere in the UI.

**Homepage** (`pages/Landing.tsx`): hero, the four existing trust points, **live**
categories and catalogue items from the API, a "how it works" section that mirrors the real
request → quotation → confirm → track flow, contact details from the public settings
endpoint, and a footer. It invents no prices, stock, discounts or testimonials.

**Shells**: buyer top bar + a new slim mobile top bar (brand + language), admin sidebar/
drawer; both gained skip links, accessible names on icon-only buttons, and the switcher.

**Accessibility fix**: admin login labels are now tied to their inputs (`htmlFor`/`id`)
with `autocomplete` hints.

**Security fix (please note)**: the public admin login page used to print
`admin / admin123`. That hint now renders only in development builds
(`import.meta.env.DEV`); the production bundle contains neither string.
The buyer page's "Demo mobile: 9999999999" hint was left as it was.

## Language: English (default) + Mizo

Frontend-only (`src/i18n/`). Strings are written `t('key', 'English text')`, so English can
never break, and any key without a Mizo entry falls back to English. The choice is stored in
`localStorage` (`mzsource_lang`) and sets `<html lang>`.

**The Mizo dictionary (`src/i18n/lus.ts`) is intentionally almost empty.** I could not
produce natural, accurate Mizo for the UI with confidence, and the brief says not to guess.
Only the language's own name ("Mizo ṭawng") is filled in. Nothing else is machine-translated.

To finish it (needs a fluent Mizo speaker):
1. `npm run i18n:extract` → writes `src/i18n/MIZO_TRANSLATION_REVIEW.csv` (every wired string).
2. The reviewer fills the `mizo` column.
3. Paste each reviewed row into `lus.ts` as `'key': 'Mizo text'`.

Wired so far (~75 strings): homepage, buyer + admin navigation, buyer OTP/profile screens,
admin login, buyer home, product card, validation messages on the buyer auth form.
**Not yet wired (still English literals):** cart, address, review, requests, request
detail, profile, notifications, product list/detail, and the content of admin pages. To wire
one, wrap the text in `t('new.key', 'English text')` and re-run the extractor.
Product names, specifications, model numbers and API data are never translated.

## Verification actually performed

- `npm run build` passes (TypeScript clean) before and after.
- Backend: all 28 source files checksum-identical to the supplied archive.
- 31 server-render checks (real components, auth context mocked as logged-in): English copy
  preserved, all 5 buyer + 9 admin routes present, real category data, no `undefined` leaks,
  Mizo mode still renders every shell.
- 10 interactive checks in a simulated DOM: clicking and arrow-keying the switcher, `<html lang>`,
  persistence, restore on return, and **a typed form value surviving a language switch**.
- Production bundle searched: no admin credentials.

## Not verified — please check on a real device

No browser could be installed in my environment, so there were **no screenshots or visual
checks**: the layout, spacing, hero artwork, overflow at 320–430 px, and font rendering of
Mizo characters were not seen by me. Contrast was checked by calculation, not by eye. The live
backend was not run against the new build (the API layer is byte-identical, so the contract
is unchanged). Please open the site at phone width and on desktop before deploying.
