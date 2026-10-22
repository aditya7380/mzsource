import React from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, ClipboardList, User, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoadingScreen } from '../common/Misc';
import { useT } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { Logo } from '../brand/Brand';

const NAV_ITEMS = [
  { to: '/buyer-app/home', key: 'nav.home', label: 'Home', icon: Home },
  { to: '/buyer-app/categories', key: 'nav.categories', label: 'Categories', icon: LayoutGrid },
  { to: '/buyer-app/cart', key: 'nav.cart', label: 'Cart', icon: ShoppingCart, cart: true },
  { to: '/buyer-app/requests', key: 'nav.requests', label: 'Requests', icon: ClipboardList },
  { to: '/buyer-app/profile', key: 'nav.profile', label: 'Profile', icon: User },
];

export default function BuyerLayout() {
  const { currentBuyer, authLoading, cart, unreadBuyerNotifCount } = useApp();
  const navigate = useNavigate();
  const { t } = useT();

  if (authLoading) return <LoadingScreen label="Loading your account…" />;
  if (!currentBuyer) return <Navigate to="/buyer-app" replace />;

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const unread = unreadBuyerNotifCount();

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <a href="#main" className="skip-link">{t('a11y.skip', 'Skip to main content')}</a>
      {/* Desktop top navbar */}
      <header className="hidden md:block sticky top-0 z-40 bg-white border-b border-[#E4DDCE]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <button onClick={() => navigate('/buyer-app/home')} className="flex-shrink-0 rounded-lg" aria-label="MZ Source">
            <Logo subtitle={t('nav.portal', 'Buyer Portal')} />
          </button>

          <nav className="flex items-center gap-1 flex-1">
            {NAV_ITEMS.filter(i => !i.cart).map(({ to, key, label, icon: Icon }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) => `flex items-center gap-2 px-3.5 h-10 rounded-lg text-[13.5px] font-semibold transition-colors ${
                  isActive ? 'bg-[#E6F2EA] text-[#0F5D3C]' : 'text-[#55605A] hover:bg-[#E6F2EA]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" /> {t(key, label)}
              </NavLink>
            ))}
          </nav>

          <LanguageSwitcher />

          <button onClick={() => navigate('/buyer-app/notifications')} aria-label={t('nav.notifications', 'Notifications')} className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Bell className="w-[19px] h-[19px] text-[#55605A]" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B4471C]" />}
          </button>

          <button onClick={() => navigate('/buyer-app/cart')} aria-label={t('nav.cart', 'Cart')} className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-[19px] h-[19px] text-[#55605A]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B4471C] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/buyer-app/profile')}
            aria-label={t('nav.profile', 'Profile')}
            className="w-9 h-9 rounded-full bg-[#0F5D3C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
          >
            {currentBuyer.fullName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
          </button>
        </div>
      </header>

      {/* Mobile top bar: brand + language (navigation lives in the bottom bar) */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E4DDCE] safe-top">
        <div className="h-14 px-4 flex items-center justify-between gap-2">
          <button onClick={() => navigate('/buyer-app/home')} aria-label="MZ Source"><Logo /></button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <main id="main" className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E4DDCE] safe-bottom">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map(({ to, key, label, icon: Icon, cart: isCart }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `relative flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] ${isActive ? 'text-[#0F5D3C]' : 'text-[#55605A]'}`}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-[21px] h-[21px]" strokeWidth={isActive ? 2.4 : 2} />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#B4471C] text-white text-[10px] font-bold flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10.5px] font-medium ${isActive ? 'font-bold' : ''}`}>{t(key, label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
