import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../data/appTypes';
import { useT } from '../../i18n/LanguageContext';
import { ProductImage } from '../common/ProductImage';

const AVAILABILITY_STYLE: Record<string, string> = {
  'In Stock': 'text-[#16A34A] bg-[#DCFCE7]',
  'Limited Stock': 'text-[#F59E0B] bg-[#FEF3C7]',
  'Out of Stock': 'text-[#DC2626] bg-[#FEE2E2]',
  'On Request': 'text-[#2F80ED] bg-[#CFE5D8]',
};

export function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const { t } = useT();
  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border border-[#E4DDCE] overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col">
      <ProductImage imageUrl={product.imageUrl} imageColor={product.imageColor} className="aspect-[4/3] w-full" />
      <div className="p-3.5 flex flex-col gap-1">
        <p className="text-[13.5px] font-semibold text-[#1B2420] leading-snug line-clamp-2 min-h-[2.4em]">{product.name}</p>
        {product.modelNumber && <p className="text-[11px] text-[#55605A]">{t('product.model', 'Model')}: {product.modelNumber}</p>}
        <span className={`self-start text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 ${AVAILABILITY_STYLE[product.availability] || ''}`}>{product.availability}</span>
        <p className="text-[12px] font-semibold text-[#0F5D3C] mt-1">{t('product.price', 'Price on request')}</p>
      </div>
    </button>
  );
}
