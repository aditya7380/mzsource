import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package as PackageIcon, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/buyer/ProductCard';
import { EmptyState } from '../../components/common/Misc';

export default function ProductList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { categories, products } = useApp();
  const [activeSub, setActiveSub] = useState('');

  const category = categories.find(c => c.id === categoryId);
  if (!category) return null;

  const filtered = products.filter(p => p.active && p.categoryId === categoryId && (!activeSub || p.subcategoryId === activeSub));

  return (
    <div className="px-5 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-1.5 text-[13px] mb-4">
        <button onClick={() => navigate('/buyer-app/categories')} className="font-semibold text-[#0F5D3C]">Categories</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#55605A]" />
        <span className="text-[#55605A]">{category.name}</span>
      </div>
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-4">{category.name}</h1>

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
        <EmptyState icon={<PackageIcon className="w-6 h-6" />} title="No products found" description="Try a different subcategory, or request the product you need." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/buyer-app/products/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}
