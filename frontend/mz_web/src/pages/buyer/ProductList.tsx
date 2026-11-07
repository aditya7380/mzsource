import React, { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Package as PackageIcon, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/buyer/ProductCard';
import { EmptyState } from '../../components/common/Misc';
import { LevelBrowser } from '../../components/education/LevelBrowser';
import { hasLevel, isEducationalCategory, isSelectableCategory } from '../../lib/catalogRules';
import { useT } from '../../i18n/LanguageContext';

export default function ProductList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { categories, buyerProducts, educationalLevels } = useApp();
  const { t } = useT();
  const [activeSub, setActiveSub] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const category = categories.find(c => c.id === categoryId);
  if (!category) return null;
  // A retired / switched-off category is no longer part of the shop
  if (!isSelectableCategory(category)) return <Navigate to="/buyer-app/categories" replace />;

  // Educational-level browsing is an EXTRA way to find products, only inside Toys & Educational
  const showLevels = isEducationalCategory(category) && educationalLevels.length > 0;
  const activeLevel = showLevels ? educationalLevels.find(l => l.id === searchParams.get('level')) : undefined;
  const selectLevel = (id: string) => setSearchParams(id ? { level: id } : {}, { replace: true });

  // No level chosen -> exactly the original "all products in this category" list
  const baseProducts = activeLevel
    ? buyerProducts.filter(p => hasLevel(p, activeLevel.id))
    : buyerProducts.filter(p => p.categoryId === categoryId);
  const filtered = baseProducts.filter(p => !activeSub || p.subcategoryId === activeSub);

  return (
    <div className="px-5 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-1.5 text-[13px] mb-4">
        <button onClick={() => navigate('/buyer-app/categories')} className="font-semibold text-[#0F5D3C]">Categories</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#55605A]" />
        <span className="text-[#55605A]">{category.name}</span>
      </div>
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-4">{category.name}</h1>

      {showLevels && (
        <LevelBrowser levels={educationalLevels} products={buyerProducts} selectedId={activeLevel?.id ?? ''} onSelect={selectLevel} />
      )}

      {activeLevel && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#E6F2EA] border border-[#CFE5D8] px-4 py-3 mb-5" role="status">
          <p className="text-[14px] text-[#1B2420]">
            {t('level.showing', 'Showing')} <span className="font-bold">{activeLevel.name}</span>
            <span className="text-[#55605A]"> · {activeLevel.groupName}</span>
            <span className="text-[#55605A]"> · {filtered.length} {filtered.length === 1 ? t('level.product', 'product') : t('level.products', 'products')}</span>
          </p>
          <button type="button" onClick={() => selectLevel('')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F5D3C] min-h-[36px] px-2 rounded-lg hover:bg-white/60 flex-shrink-0">
            <X className="w-3.5 h-3.5" aria-hidden="true" /> {t('level.clear', 'Show all products')}
          </button>
        </div>
      )}

      {category.subcategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
          <button onClick={() => setActiveSub('')} className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border transition-colors ${!activeSub ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>All</button>
          {category.subcategories.filter(s => s.active).map(sub => (
            <button key={sub.id} onClick={() => setActiveSub(sub.id)} className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border whitespace-nowrap transition-colors ${activeSub === sub.id ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<PackageIcon className="w-6 h-6" />} title="No products found" description={activeLevel ? 'No products or kits are listed for this level yet. Try another level, or show all products.' : 'Try a different subcategory, or request the product you need.'} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/buyer-app/products/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}
