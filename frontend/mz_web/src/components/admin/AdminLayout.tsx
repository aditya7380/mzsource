import React, { useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Users, Package, LayoutGrid, FileText, Bell,
  BarChart3, Settings as SettingsIcon, LogOut, Menu, X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoadingScreen } from '../common/Misc';
import { useT } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { Logo } from '../brand/Brand';

const NAV_ITEMS = [
  { to: '/admin/dashboard', key: 'admin.nav.dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/requests', key: 'admin.nav.requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/customers', key: 'admin.nav.customers', label: 'Customers', icon: Users },
  { to: '/admin/products', key: 'admin.nav.products', label: 'Products', icon: Package },
  { to: '/admin/categories', key: 'admin.nav.categories', label: 'Categories', icon: LayoutGrid },
  { to: '/admin/quotations', key: 'admin.nav.quotations', label: 'Quotations', icon: FileText },
  { to: '/admin/notifications', key: 'admin.nav.notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/admin/analytics', key: 'admin.nav.analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', key: 'admin.nav.settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { adminLoggedIn, authLoading, logoutAdmin, unreadAdminNotifCount, settings } = useApp();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useT();

  if (authLoading) return <LoadingScreen label="Loading admin dashboard…" />;
  if (!adminLoggedIn) return <Navigate to="/admin/login" replace />;

  const unread = unreadAdminNotifCount();

  function handleSignOut() {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  }

  const SidebarContent = (
    <>
      <div className="h-16 flex items-center px-5 border-b border-[#E4DDCE]">
        <Logo subtitle={t('admin.portal', 'Admin Portal')} />
      </div>
      <nav aria-label={t('admin.nav.label', 'Admin')} className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, key, label, icon: Icon, badge }) => (
          <NavLink
            key={to} to={to} onClick={() => setDrawerOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-3 h-11 rounded-xl text-[14px] font-medium transition-colors ${
              isActive ? 'bg-[#E6F2EA] text-[#0F5D3C] font-bold' : 'text-[#1B2420] hover:bg-[#E6F2EA]'
            }`}
          >
            <span className="flex items-center gap-3"><Icon className="w-4.5 h-4.5" aria-hidden="true" />{t(key, label)}</span>
            {badge && unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#B4471C] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-[#E4DDCE]">
        <div className="mb-3"><LanguageSwitcher /></div>
        <p className="text-[13px] font-bold text-[#1B2420]">{t('admin.role', 'Administrator')}</p>
        <p className="text-[11.5px] text-[#55605A] truncate">{settings?.email || 'admin@mzsource.in'}</p>
        <button onClick={handleSignOut} className="w-full flex items-center gap-2 mt-3 px-3 h-10 rounded-xl text-[13.5px] font-semibold text-[#DC2626] bg-[#FEE2E2] hover:bg-red-100">
          <LogOut className="w-4 h-4" aria-hidden="true" /> {t('admin.signout', 'Sign Out')}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F0] lg:flex">
      <a href="#main" className="skip-link">{t('a11y.skip', 'Skip to main content')}</a>
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-white border-r border-[#E4DDCE] sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E4DDCE]">
        <div className="flex items-center justify-between h-14 px-4">
          <Logo subtitle={t('admin.portal', 'Admin Portal')} />
          <button onClick={() => setDrawerOpen(true)} aria-label={t('admin.menu', 'Open menu')} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex justify-end p-2"><button onClick={() => setDrawerOpen(false)} aria-label={t('admin.close', 'Close menu')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            {SidebarContent}
          </div>
        </div>
      )}

      <main id="main" className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
