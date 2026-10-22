import React, { useId } from 'react';

/** MZ Source mark: two overlapping hill peaks (an "M") under a small sun. Original artwork. */
export function LogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true" focusable="false">
      <rect width="36" height="36" rx="9" fill="#0F5D3C" />
      <path d="M5 28 14 11l6 10 4-6 7 13Z" fill="#FAF7F0" />
      <path d="M5 28 14 11l2.2 3.7L11 28Z" fill="#CFE5D8" />
      <circle cx="26" cy="9.5" r="2.6" fill="#E7A27D" />
    </svg>
  );
}

export function Logo({ tone = 'dark', subtitle }: { tone?: 'dark' | 'light'; subtitle?: string }) {
  const text = tone === 'light' ? 'text-white' : 'text-ink';
  const sub = tone === 'light' ? 'text-white/75' : 'text-muted';
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-left leading-tight">
        <span className={`block font-display font-bold text-[16px] ${text}`}>MZ Source</span>
        {subtitle && <span className={`block text-[10.5px] ${sub}`}>{subtitle}</span>}
      </span>
    </span>
  );
}

/**
 * Layered hill silhouettes with soft mist, plus faint circuit traces
 * (landscape + electronics). Purely decorative, so aria-hidden.
 */
export function HillsScene({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={className}
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAF7F0" stopOpacity="0" />
          <stop offset="1" stopColor="#FAF7F0" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* circuit traces — thin, low contrast, upper right */}
      <g stroke="#FAF7F0" strokeOpacity="0.22" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M980 70h120l36 36h140" />
        <path d="M1040 140h90l28 28h180" />
        <path d="M900 200h150l30-30" />
        <path d="M1180 40v46l40 40" />
      </g>
      <g fill="#FAF7F0" fillOpacity="0.4">
        <circle cx="1276" cy="106" r="4" /><circle cx="1338" cy="168" r="4" />
        <circle cx="1080" cy="170" r="4" /><circle cx="1220" cy="126" r="4" />
      </g>

      <g className="mist-drift">
        <path d="M-40 330C80 280 190 310 310 262c130-52 220 8 350-18 130-26 230 40 370 6 130-32 250 14 450-34V520H-40Z" fill="#2F7A56" fillOpacity="0.38" />
        <rect x="-40" y="250" width="1520" height="140" fill={`url(#${id}-mist)`} />
      </g>
      <path d="M-40 390C100 340 210 372 340 330c120-38 230 20 360 0 140-22 240 40 380 12 140-28 250 6 400-30V520H-40Z" fill="#1F6B47" fillOpacity="0.62" />
      <rect x="0" y="330" width="1440" height="110" fill={`url(#${id}-mist)`} />
      <path d="M-40 440C90 400 200 430 330 400c130-30 240 18 380 0 130-16 250 30 380 8 130-22 240-4 370-24V520H-40Z" fill="#0F5D3C" />
      <path d="M-40 486C110 462 230 480 380 462c130-16 250 14 400 2 150-12 270 8 420-8 90-10 170-6 240-12V520H-40Z" fill="#0A4429" />
    </svg>
  );
}

/**
 * Restrained woven-stripe divider: generic diamond-and-stripe geometry inspired
 * by handloom textiles in general. It deliberately does NOT reproduce any
 * specific traditional Mizo pattern.
 */
export function WeaveBand({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`w-full ${className}`} height="14" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${id}-w`} width="28" height="14" patternUnits="userSpaceOnUse">
          <rect width="28" height="2" y="0" fill="currentColor" opacity="0.55" />
          <rect width="28" height="2" y="12" fill="currentColor" opacity="0.55" />
          <path d="M14 2.5 21 7l-7 4.5L7 7Z" fill="currentColor" opacity="0.85" />
          <path d="M0 2.5 7 7 0 11.5Z M28 2.5 21 7l7 4.5Z" fill="currentColor" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#${id}-w)`} />
    </svg>
  );
}
