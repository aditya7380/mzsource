import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/buyer/ProductCard';
import { EmptyState } from '../../components/common/Misc';

export default function SearchPage() {
  const navigate = useNavigate();
  const { products } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p => p.active && (p.name.toLowerCase().includes(q) || p.modelNumber.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
  }, [query, products]);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-6">
      <div className="relative mb-6">
        <SearchIcon className="w-4.5 h-4.5 text-[#55605A] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          autoFocus value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search products, model number…"
          className="w-full h-12 rounded-xl bg-white border border-[#E4DDCE] pl-11 pr-4 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]"
        />
      </div>

      {!query.trim() && <EmptyState icon={<SearchIcon className="w-6 h-6" />} title="Search our catalogue" description="Try 'Arduino', 'paper cups', or a model number" />}

      {query.trim() && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon className="w-6 h-6" />} title="No exact product found"
          description="Can't find what you need? Request a product and we'll source it for you."
          action={<button onClick={() => navigate('/buyer-app/request-product')} className="flex items-center gap-1.5 text-sm font-semibold text-[#0F5D3C]"><PlusCircle className="w-4 h-4" /> Request a Product</button>}
        />
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/buyer-app/products/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}
