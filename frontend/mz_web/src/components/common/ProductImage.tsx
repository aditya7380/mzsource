import React, { useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';

/**
 * Accepts only http(s) links or site-relative paths such as "/product-images/esp32.jpg"
 * (files placed in the frontend's public/ folder). Anything else is ignored, so a
 * mistyped value can never break the page; the coloured box is shown instead.
 */
export function safeImageUrl(url?: string | null): string | null {
  const v = (url ?? '').trim();
  if (!v) return null;
  if (/^https?:\/\/\S+$/i.test(v)) return v;
  if (/^\/(?!\/)\S*$/.test(v)) return v;
  return null;
}

interface Props {
  /** Product name (used as alt text only when `alt` is not given) */
  name?: string;
  imageUrl?: string | null;
  /** The product's existing colour, used for the fallback box exactly as before */
  imageColor?: string;
  /** Size / shape classes, e.g. "aspect-[4/3] w-full" */
  className?: string;
  iconClassName?: string;
  /** Use alt="" when the product name is already printed next to the image */
  alt?: string;
  eager?: boolean;
}

/**
 * Product picture with a graceful fallback:
 *   image URL set + loads  -> the photo (contained on white, like a marketplace listing)
 *   no URL / bad URL / load error -> the original coloured box with the package icon
 */
export function ProductImage({ imageUrl, imageColor, className = '', iconClassName = 'w-9 h-9', alt = '', eager = false }: Props) {
  const src = safeImageUrl(imageUrl);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { setState(src ? 'loading' : 'error'); }, [src]);

  // Cached images can finish before React attaches handlers
  useEffect(() => {
    const el = imgRef.current;
    if (src && el && el.complete) setState(el.naturalWidth > 0 ? 'loaded' : 'error');
  }, [src]);

  const showFallback = !src || state === 'error';

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={showFallback ? { backgroundColor: imageColor || '#E6F2EA' } : { backgroundColor: '#FFFFFF' }}
    >
      {showFallback && <Package className={`${iconClassName} text-white/85`} strokeWidth={1.5} aria-hidden="true" />}
      {src && !showFallback && (
        <>
          {state === 'loading' && <div className="skeleton absolute inset-0" aria-hidden="true" />}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setState('loaded')}
            onError={() => setState('error')}
            className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-200 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}
    </div>
  );
}
