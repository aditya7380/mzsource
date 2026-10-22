import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Logo } from '../../components/brand/Brand';
import { CUSTOMER_TYPES } from '../../data/appTypes';
import type { CustomerType } from '../../data/appTypes';

type Step = 'mobile' | 'otp' | 'profile';

export default function BuyerAuth() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, createBuyerProfile } = useApp();
  const { t } = useT();

  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Individual');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(mobile)) { setError(t('auth.err.mobile', 'Enter a valid 10-digit mobile number')); return; }
    setLoading(true);
    try {
      const res = await sendOtp(mobile);
      setDevOtp(res.devOtp ?? null);
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (otp.length < 4) { setError(t('auth.err.otp', 'Enter the OTP sent to your mobile')); return; }
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      if (res.isNewProfile) setStep('profile');
      else navigate('/buyer-app/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError(t('auth.err.name', 'Please enter your full name'));
    setLoading(true);
    try {
      await createBuyerProfile({
        fullName: fullName.trim(), mobile, customerType, businessName: businessName.trim(),
        address: city.trim() ? {
          label: 'Primary', building: '', street: '', locality: '', sector: '',
          city: city.trim(), district: '', state: 'Mizoram', pinCode: '', landmark: '', isDefault: true,
        } : undefined,
      });
      navigate('/buyer-app/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E4DDCE] overflow-hidden">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-[#E4DDCE]">
          <button onClick={() => (step === 'mobile' ? navigate('/') : setStep(step === 'profile' ? 'otp' : 'mobile'))} aria-label={t('common.back', 'Back')} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-4.5 h-4.5 text-[#1B2420]" aria-hidden="true" />
          </button>
          <Logo />
          <span className="flex-1" />
          <LanguageSwitcher />
        </div>

        <div className="p-7">
          {step === 'mobile' && (
            <form onSubmit={handleSendOtp}>
              <div className="w-14 h-14 rounded-2xl bg-[#E6F2EA] flex items-center justify-center mb-5"><Phone className="w-6 h-6 text-[#0F5D3C]" /></div>
              <h2 className="text-2xl font-extrabold text-[#1B2420]">{t('auth.welcome', 'Welcome to MZ Source')}</h2>
              <p className="text-[#55605A] text-[14.5px] mt-1.5 mb-7">{t('auth.mobile.help', "Enter your mobile number. We'll send you a one-time code to verify.")}</p>

              <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('auth.mobile.label', 'Mobile Number')}</label>
              <div className="flex items-center gap-2 h-13 rounded-xl border border-[#E4DDCE] bg-white px-4 focus-within:ring-2 focus-within:ring-[#0F5D3C]/30 focus-within:border-[#0F5D3C] transition-colors">
                <span className="text-[#55605A] font-medium text-[15px]">+91</span>
                <div className="w-px h-6 bg-[#E4DDCE]" />
                <input
                  type="tel" inputMode="numeric" maxLength={10} autoFocus placeholder="9999999999"
                  value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 h-12 text-[16px] outline-none placeholder:text-[#55605A]/60 tracking-wide"
                />
              </div>

              {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}

              <button type="submit" disabled={loading} className="w-full h-13 mt-7 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60 transition-colors">
                {loading ? t('auth.sending', 'Sending…') : t('auth.send', 'Send OTP')}
              </button>
              <p className="text-center text-xs text-[#55605A] mt-4">Demo mobile: <span className="font-semibold">9999999999</span></p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="w-14 h-14 rounded-2xl bg-[#E6F2EA] flex items-center justify-center mb-5"><ShieldCheck className="w-6 h-6 text-[#0F5D3C]" /></div>
              <h2 className="text-2xl font-extrabold text-[#1B2420]">{t('auth.verify.title', 'Verify your number')}</h2>
              <p className="text-[#55605A] text-[14.5px] mt-1.5 mb-7">{t('auth.verify.help', 'Enter the 6-digit code sent to')} <span className="font-semibold text-[#1B2420]">+91 {mobile}</span></p>

              <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('auth.otp.label', 'One-Time Password')}</label>
              <input
                ref={otpRef} type="tel" inputMode="numeric" maxLength={6} placeholder="••••••"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 rounded-xl border border-[#E4DDCE] bg-white px-4 text-[22px] tracking-[0.5em] font-bold text-center outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] transition-colors"
              />

              {devOtp && <p className="text-center text-xs text-[#B4471C] mt-3 bg-[#FBEADF] rounded-lg py-2">Demo mode — your OTP is <span className="font-bold">{devOtp}</span></p>}
              {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}

              <button type="submit" disabled={loading} className="w-full h-13 mt-7 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60 transition-colors">
                {loading ? t('auth.verifying', 'Verifying…') : t('auth.verify.btn', 'Verify & Continue')}
              </button>
              <button type="button" onClick={handleSendOtp as any} className="w-full text-center text-sm font-semibold text-[#0F5D3C] mt-4 py-2">{t('auth.resend', 'Resend OTP')}</button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleCreateProfile}>
              <div className="w-14 h-14 rounded-2xl bg-[#E6F2EA] flex items-center justify-center mb-5"><UserIcon className="w-6 h-6 text-[#0F5D3C]" /></div>
              <h2 className="text-2xl font-extrabold text-[#1B2420]">{t('auth.profile.title', 'Create Your Profile')}</h2>
              <p className="text-[#55605A] text-[14.5px] mt-1.5 mb-6">{t('auth.profile.help', "Just once — we'll remember you next time.")}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('auth.fullname', 'Full Name')} *</label>
                  <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Lalthansanga Sailo"
                    className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('auth.type', 'Customer Type')} *</label>
                  <select value={customerType} onChange={e => setCustomerType(e.target.value as CustomerType)}
                    className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]">
                    {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {['Shopkeeper', 'School/College', 'Business'].includes(customerType) && (
                  <div>
                    <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{customerType === 'School/College' ? 'Institution Name' : 'Shop / Business Name'}</label>
                    <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Sailo Electronics & Gifts"
                      className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{t('auth.city', 'City / Town')}</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Aizawl"
                    className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
                  <p className="text-xs text-[#55605A] mt-1">You can add your full delivery address later.</p>
                </div>
              </div>

              {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}

              <button type="submit" disabled={loading} className="w-full h-13 mt-7 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60 transition-colors">
                {loading ? t('auth.creating', 'Creating…') : t('auth.profile.btn', 'Create Profile & Continue')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
