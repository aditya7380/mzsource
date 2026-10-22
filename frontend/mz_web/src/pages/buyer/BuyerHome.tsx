import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Boxes, Cpu, Package, GraduationCap, ChevronRight, PlusCircle, CheckCircle2, MapPin, FileText, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/buyer/ProductCard';
import { useT } from '../../i18n/LanguageContext';
import { HillsScene } from '../../components/brand/Brand';

const ICONS: Record<string, React.ElementType> = { cpu: Cpu, package: Package, 'graduation-cap': GraduationCap };
const FEATURES = [
  { icon: CheckCircle2, key: 'home.f1', label: 'Verified Sourcing', desc: 'Every product checked before it reaches you' },
  { icon: MapPin, key: 'home.f2', label: 'Request Tracking', desc: 'Follow your request from pending to delivered' },
  { icon: FileText, key: 'home.f3', label: 'Quotation First', desc: 'See the price before you commit — no surprises' },
  { icon: Headphones, key: 'home.f4', label: 'Local Support', desc: 'Call our team directly for any request' },
];

export default function BuyerHome() {
  const navigate = useNavigate();
  const { t } = useT();
  const { categories, products, currentBuyer } = useApp();
  const firstName = currentBuyer?.fullName?.split(' ')[0] || 'there';
  const popular = products.filter(p => p.active).slice(0, 8);

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F5D3C] to-[#0A4429] md:rounded-b-3xl">
        <HillsScene className="absolute inset-x-0 bottom-0 w-full h-full opacity-35 pointer-events-none" />
        <div className="relative px-5 md:px-8 pt-6 md:pt-10 pb-8 md:pb-12">
          <p className="text-white/85 text-xs md:text-sm font-medium">{t('home.welcome', 'Welcome back,')}</p>
          <h1 className="text-white text-lg md:text-3xl font-extrabold mb-5 md:mb-6">{firstName} 👋</h1>

          <button
            onClick={() => navigate('/buyer-app/search')}
            className="w-full md:max-w-xl h-12 rounded-xl bg-white flex items-center gap-2.5 px-4 shadow-sm active:scale-[0.99] transition-transform"
          >
            <Search className="w-4.5 h-4.5 text-[#55605A]" aria-hidden="true" />
            <span className="text-[#55605A] text-[14px]">{t('home.search', 'Search products, model number…')}</span>
          </button>
        </div>
      </div>

      <div className="px-5 md:px-8 pt-6 pb-8 max-w-7xl mx-auto">
        {/* Feature strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {FEATURES.map(f => (
            <div key={f.label} className="bg-white rounded-2xl border border-[#E4DDCE] p-4">
              <div className="w-9 h-9 rounded-lg bg-[#E6F2EA] flex items-center justify-center mb-2.5"><f.icon className="w-4.5 h-4.5 text-[#0F5D3C]" /></div>
              <p className="text-[13px] font-bold text-[#1B2420]">{t(f.key, f.label)}</p>
              <p className="text-[11.5px] text-[#55605A] mt-0.5 leading-snug hidden lg:block">{t(`${f.key}.d`, f.desc)}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#1B2420]">{t('home.categories', 'Categories')}</h2>
          <button onClick={() => navigate('/buyer-app/categories')} className="text-xs font-semibold text-[#0F5D3C] flex items-center gap-0.5">{t('home.viewall', 'View all')} <ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {categories.filter(c => c.active && c.name !== 'Disposable Products').map(cat => {
            const Icon = ICONS[cat.icon] || Boxes;
            return (
              <button key={cat.id} onClick={() => navigate(`/buyer-app/categories/${cat.id}`)}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-[#E4DDCE] p-3.5 active:scale-95 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <span className="text-[11.5px] font-semibold text-[#1B2420] text-center leading-tight line-clamp-2">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Request a product CTA */}
        <button
          onClick={() => navigate('/buyer-app/request-product')}
          className="w-full flex items-center gap-3.5 bg-[#FBEADF] rounded-2xl p-4 mb-8 active:scale-[0.99] hover:shadow-sm transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0"><PlusCircle className="w-5.5 h-5.5 text-[#B4471C]" /></div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#1B2420]">{t('home.cant', "Can't find what you need?")}</p>
            <p className="text-xs text-[#55605A]">{t('home.cant.sub', "Request a product directly and we'll source it for you")}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#B4471C]" />
        </button>

        {/* Popular products */}
        <h2 className="text-[16px] font-bold text-[#1B2420] mb-3">{t('home.popular', 'Popular Products')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popular.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/buyer-app/products/${p.id}`)} />)}
        </div>
      </div>
    </div>
  );
}
