import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User as UserIcon, Boxes } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Logo } from '../../components/brand/Brand';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useApp();
  const { t } = useT();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const ok = await loginAdmin(username, password);
      if (ok) navigate('/admin/dashboard', { replace: true });
      else setError(t('admin.login.err', 'Invalid username or password'));
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A4429] via-[#0F5D3C] to-[#0A4429] px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Logo />
          <LanguageSwitcher />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#E6F2EA] flex items-center justify-center mb-5"><ShieldCheck className="w-6.5 h-6.5 text-[#0F5D3C]" aria-hidden="true" /></div>
        <h1 className="text-2xl font-extrabold text-[#1B2420]">{t('admin.login.title', 'Admin Sign In')}</h1>
        <p className="text-[#55605A] text-[14px] mt-1 mb-6">{t('admin.login.sub', 'MZ Source Admin Dashboard')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('admin.login.username', 'Username')}</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#55605A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="admin-username" name="username" autoComplete="username" autoFocus value={username} onChange={e => setUsername(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white pl-10 pr-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-password" className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('admin.login.password', 'Password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#55605A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="admin-password" name="password" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white pl-10 pr-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-[#DC2626]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60">{loading ? t('admin.login.signing', 'Signing in…') : t('admin.login.btn', 'Sign In')}</button>
        </form>

        {import.meta.env.DEV && (
          <>
            <p className="text-center text-xs text-[#55605A] mt-6">Demo credentials: <span className="font-semibold">admin / admin123</span></p>
            <p className="text-center text-[10.5px] text-[#6B756F] mt-1">Stored securely in PostgreSQL — this is your real admin account.</p>
          </>
        )}
      </div>
    </div>
  );
}
