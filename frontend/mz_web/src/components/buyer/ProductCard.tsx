import React from 'react';
import {
  Package,
  GraduationCap,
  Lightbulb,
  Cpu,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { Product } from '../../data/appTypes';
import { useT } from '../../i18n/LanguageContext';

const AVAILABILITY_STYLE: Record<string, string> = {
  'In Stock': 'text-[#16A34A] bg-[#DCFCE7]',
  'Limited Stock': 'text-[#B45309] bg-[#FEF3C7]',
  'Out of Stock': 'text-[#DC2626] bg-[#FEE2E2]',
  'On Request': 'text-[#1D4ED8] bg-[#DBEAFE]',
};

function getKitInfo(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('school explorer')) {
    return {
      level: 'Classes 6–8',
      label: 'BEGINNER',
      description: 'LED circuits, switches & science experiments',
      icon: Lightbulb,
      accent: '#176B48',
      background: '#E1F3E8',
    };
  }

  if (normalized.includes('young innovator')) {
    return {
      level: 'Classes 9–12',
      label: 'INNOVATOR',
      description: 'Arduino, sensors & automatic light projects',
      icon: Cpu,
      accent: '#245DB5',
      background: '#E4EEFF',
    };
  }

  if (normalized.includes('college project')) {
    return {
      level: 'College / Diploma',
      label: 'ADVANCED',
      description: 'IoT, robotics & embedded-system prototypes',
      icon: GraduationCap,
      accent: '#A65320',
      background: '#FBEBDD',
    };
  }

  return null;
}

export function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const { t } = useT();
  const kit = getKitInfo(product.name);
  const Icon = kit?.icon ?? Package;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-[#E4DDCE] overflow-hidden hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 flex flex-col w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5D3C]"
      aria-label={`View ${product.name}`}
    >
      <div
        className="relative aspect-[4/3] w-full flex items-center justify-center overflow-hidden"
        style={{
          background: kit
            ? `linear-gradient(135deg, ${kit.background}, #FFFFFF)`
            : product.imageColor || '#E6F2EA',
        }}
      >
        {kit ? (
          <>
            <div
              className="absolute -right-5 -top-6 w-28 h-28 rounded-full opacity-60"
              style={{ backgroundColor: kit.background }}
            />
            <div
              className="absolute -left-7 -bottom-8 w-32 h-32 rounded-full opacity-60"
              style={{ backgroundColor: kit.background }}
            />
            <div
              className="relative z-10 w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm border border-white/80 group-hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Icon
                className="w-10 h-10"
                style={{ color: kit.accent }}
                strokeWidth={1.7}
              />
            </div>
            <span
              className="absolute top-3 left-3 text-[9px] tracking-wider font-extrabold px-2 py-1 rounded-full"
              style={{ color: kit.accent, backgroundColor: '#FFFFFF' }}
            >
              <Sparkles className="inline w-3 h-3 mr-1" />
              DEMO KIT
            </span>
          </>
        ) : (
          <Package
            className="w-9 h-9 text-white/85"
            strokeWidth={1.5}
          />
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1 w-full">
        {kit && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
            <GraduationCap
              className="w-3.5 h-3.5"
              style={{ color: kit.accent }}
            />
            <span style={{ color: kit.accent }}>{kit.level}</span>
            <span className="ml-auto rounded-full px-2 py-0.5 bg-[#F3F4F6] text-[#55605A]">
              {kit.label}
            </span>
          </div>
        )}

        <p className="text-[14px] font-bold text-[#1B2420] leading-snug line-clamp-2 min-h-[2.6em]">
          {product.name}
        </p>

        {kit && (
          <p className="text-[12px] text-[#55605A] leading-relaxed min-h-[2.5em]">
            {kit.description}
          </p>
        )}

        {product.modelNumber && (
          <p className="text-[10px] text-[#737C76]">
            {t('product.model', 'Model')}: {product.modelNumber}
          </p>
        )}

        <div className="mt-auto pt-1 flex flex-col gap-2">
          <span
            className={`self-start text-[10px] font-bold px-2 py-1 rounded-full ${
              AVAILABILITY_STYLE[product.availability] || 'text-[#55605A] bg-[#F3F4F6]'
            }`}
          >
            {product.availability}
          </span>

          <div className="flex items-center justify-between gap-2 border-t border-[#F0ECE4] pt-2">
            <span className="text-[12px] font-bold text-[#0F5D3C]">
              {t('product.price', 'Price on request')}
            </span>
            {kit ? (
              <span className="text-[11px] font-semibold text-[#0F5D3C] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                View kit
              </span>
            ) : (
              <span className="text-[11px] text-[#737C76]">View details →</span>
            )}
          </div>
        </div>

        {kit && (
          <p className="text-[10px] text-[#737C76] leading-relaxed">
            Illustrative demo listing · Confirm components and availability
            before ordering.
          </p>
        )}
      </div>
    </button>
  );
}