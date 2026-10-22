import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Cpu, Package, GraduationCap, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS: Record<string, React.ElementType> = { cpu: Cpu, package: Package, 'graduation-cap': GraduationCap };

export default function Categories() {
  const navigate = useNavigate();
  const { categories } = useApp();

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-5">Categories</h1>
      <div className="space-y-3">
        {categories.filter(c => c.active && c.name !== 'Disposable Products').map(cat => {
          const Icon = ICONS[cat.icon] || Boxes;
          return (
            <button key={cat.id} onClick={() => navigate(`/buyer-app/categories/${cat.id}`)}
              className="w-full flex items-center gap-4 bg-white rounded-2xl border border-[#E4DDCE] p-4 hover:shadow-sm active:scale-[0.99] transition-all">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bgColor }}>
                <Icon className="w-6 h-6" style={{ color: cat.color }} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-[#1B2420] text-[15px]">{cat.name}</p>
                <p className="text-xs text-[#55605A] line-clamp-1">{cat.description}</p>
                <p className="text-[11px] text-[#0F5D3C] font-medium mt-0.5">{cat.subcategories.length} subcategories</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#55605A] flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
