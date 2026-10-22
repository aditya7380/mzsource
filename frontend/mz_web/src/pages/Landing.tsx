import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Boxes, Cpu, GraduationCap, Package, CheckCircle2, MapPin, FileText, Headphones,
  Search, ClipboardList, Receipt, PackageCheck, Phone, Mail, ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { HillsScene, Logo, WeaveBand } from '../components/brand/Brand';
import { ProductCard } from '../components/buyer/ProductCard';

const CATEGORY_ICONS: Record<string, React.ElementType> = { cpu: Cpu, package: Package, 'graduation-cap': GraduationCap };

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useT();
  const { categories, products, settings, currentBuyer, authLoading } = useApp();

  const activeCategories = categories.filter(c => c.active && c.name !== 'Disposable Products');
  const featured = [...products]
    .filter(p => p.active)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const buyerHref = currentBuyer ? '/buyer-app/home' : '/buyer-app';

  const trust = [
    { icon: CheckCircle2, key: 'landing.trust.verified', label: 'Verified Sourcing' },
    { icon: MapPin, key: 'landing.trust.tracking', label: 'Request Tracking' },
    { icon: FileText, key: 'landing.trust.quotation', label: 'Quotation First' },
    { icon: Headphones, key: 'landing.trust.support', label: 'Local Support' },
  ];

  const steps = [
    { icon: Search, n: '01', key: 'landing.step1', title: 'Browse & choose', body: 'Explore electronics, robotics and educational materials, then add what you need to your request cart.' },
    { icon: ClipboardList, n: '02', key: 'landing.step2', title: 'Send your request', body: 'Confirm your delivery address and submit. No online payment is taken at this stage.' },
    { icon: Receipt, n: '03', key: 'landing.step3', title: 'Receive a quotation', body: 'Our team checks availability and sourcing, then sends you a quotation to review.' },
    { icon: PackageCheck, n: '04', key: 'landing.step4', title: 'Confirm & track', body: 'Confirm the quotation and follow your request from Pending through to Completed.' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#main" className="skip-link">{t('a11y.skip', 'Skip to main content')}</a>

      {/* ───────── Hero ───────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary-deep via-primary-deep to-primary text-white">
        <HillsScene className="absolute inset-x-0 bottom-0 w-full h-[62%] md:h-[78%] pointer-events-none" />

        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-3">
            <Link to="/" aria-label="MZ Source"><Logo tone="light" /></Link>
            <nav aria-label={t('landing.nav.label', 'Primary')} className="hidden md:flex items-center gap-7 text-[14px] font-medium text-white/90">
              <a href="#how" className="hover:text-white">{t('landing.nav.how', 'How it works')}</a>
              <a href="#categories" className="hover:text-white">{t('landing.nav.categories', 'Categories')}</a>
              <a href="#contact" className="hover:text-white">{t('landing.nav.contact', 'Contact')}</a>
            </nav>
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher tone="light" />
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-[13px] font-semibold text-white/90 hover:bg-white/10"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t('landing.admin', 'Admin')}
              </Link>
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="outline-none">
          <section aria-labelledby="hero-title" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-56 md:pt-16 md:pb-72 lg:pb-80">
            <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-start">
              <div>
                <p className="fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7A27D]" aria-hidden="true" />
                  {t('landing.eyebrow', 'Local Products. Easy Requests.')}
                </p>
                <h1 id="hero-title" className="fade-up fade-up-2 mt-5 text-[38px] leading-[1.08] sm:text-5xl lg:text-[58px] font-bold text-white">
                  {t('landing.title', 'Find the components your project needs.')}
                </h1>
                <p className="fade-up fade-up-3 mt-5 max-w-xl text-[16px] md:text-[18px] leading-relaxed text-[#D7E8DE]">
                  {t('landing.subtitle', 'Browse electronics, robotics and educational materials, send a request, and receive a quotation — all in one place.')}
                </p>

                <div className="fade-up fade-up-3 mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(buyerHref)}
                    className="h-13 min-h-[52px] px-7 rounded-xl bg-canvas text-primary-deep font-bold text-[15.5px] inline-flex items-center justify-center gap-2 shadow-lg shadow-black/15 hover:bg-white transition-colors"
                  >
                    {currentBuyer ? t('landing.cta.account', 'Go to my account') : t('landing.cta.buyer', 'Continue as Buyer')}
                    <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
                  </button>
                  <a
                    href="#categories"
                    className="min-h-[52px] px-7 rounded-xl border border-white/40 text-white font-semibold text-[15.5px] inline-flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    {t('landing.cta.browse', 'See what is available')}
                  </a>
                </div>
              </div>

              {/* How a request moves — uses the platform's real statuses, no sample data */}
              <aside aria-label={t('landing.flow.aria', 'How a request moves')} className="hidden lg:block fade-up fade-up-3">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/75">
                    {t('landing.flow.title', 'How a request moves')}
                  </p>
                  <ol className="mt-4 space-y-3.5">
                    {[
                      ['Pending', 'We have your request'],
                      ['Selected', 'A quotation is on its way'],
                      ['Confirmed', 'You accepted the quotation'],
                      ['Completed', 'All done'],
                    ].map(([s, d], i) => (
                      <li key={s} className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-full bg-canvas text-primary-deep text-[13px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span>
                          <span className="block text-[14.5px] font-semibold text-white">{t(`landing.flow.s${i + 1}`, s)}</span>
                          <span className="block text-[12.5px] text-white/75">{t(`landing.flow.d${i + 1}`, d)}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </div>
          </section>

          {/* ───────── Trust strip ───────── */}
          <section aria-label={t('landing.trust.aria', 'Why MZ Source')} className="relative z-10 -mt-44 md:-mt-60 lg:-mt-64 pb-2">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {trust.map(f => (
                  <li key={f.key} className="flex items-center gap-3 rounded-2xl bg-canvas/95 border border-line px-4 py-3.5 shadow-sm">
                    <span className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
                    </span>
                    <span className="text-[13.5px] font-semibold text-ink">{t(f.key, f.label)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>

      <div className="text-primary/60 mt-2"><WeaveBand /></div>

      {/* ───────── Categories (live data) ───────── */}
      <section id="categories" aria-labelledby="cat-title" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20 scroll-mt-4">
        <div className="max-w-2xl">
          <h2 id="cat-title" className="font-display text-3xl md:text-4xl font-bold text-ink">{t('landing.cat.title', 'What you can request')}</h2>
          <p className="mt-3 text-[16px] text-muted leading-relaxed">
            {t('landing.cat.sub', 'Product groups currently in the MZ Source catalogue. Sign in to browse every item and its details.')}
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4" aria-busy={authLoading && activeCategories.length === 0}>
          {authLoading && activeCategories.length === 0 &&
            [0, 1, 2].map(i => <div key={i} className="skeleton h-40 rounded-2xl" aria-hidden="true" />)}

          {activeCategories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.icon] || Boxes;
            return (
              <Link
                key={cat.id}
                to={`/buyer-app/categories/${cat.id}`}
                className="group rounded-2xl bg-white border border-line p-6 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                  <Icon className="w-6 h-6" style={{ color: cat.color }} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[17px] font-bold text-ink">{cat.name}</h3>
                <p className="mt-1.5 text-[14px] text-muted leading-relaxed line-clamp-2">{cat.description}</p>
                <p className="mt-4 flex items-center justify-between text-[13px] font-semibold text-primary">
                  <span>{cat.subcategories.filter(s => s.active).length} {t('landing.cat.subs', 'sub-categories')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </p>
              </Link>
            );
          })}

          {!authLoading && activeCategories.length === 0 && (
            <p className="md:col-span-3 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
              {t('landing.cat.empty', 'The catalogue is not available right now. Please try again shortly.')}
            </p>
          )}
        </div>

        {featured.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-2xl font-bold text-ink">{t('landing.featured.title', 'From the catalogue')}</h3>
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/buyer-app/products/${p.id}`)} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how" aria-labelledby="how-title" className="bg-primary-tint border-y border-line scroll-mt-4">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 id="how-title" className="font-display text-3xl md:text-4xl font-bold text-ink">{t('landing.how.title', 'How MZ Source works')}</h2>
            <p className="mt-3 text-[16px] text-muted leading-relaxed">
              {t('landing.how.sub', 'A simple, request-based process — you see the quotation before you commit.')}
            </p>
          </div>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(s => (
              <li key={s.key} className="rounded-2xl bg-white border border-line p-6">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center"><s.icon className="w-5 h-5" aria-hidden="true" /></span>
                  <span className="font-display text-3xl font-bold text-primary/25" aria-hidden="true">{s.n}</span>
                </div>
                <h3 className="mt-5 text-[16.5px] font-bold text-ink">{t(`${s.key}.title`, s.title)}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{t(`${s.key}.body`, s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Final call to action ───────── */}
      <section aria-labelledby="cta-title" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary-deep text-white px-6 py-12 md:px-14 md:py-14">
          <HillsScene className="absolute inset-x-0 bottom-0 w-full h-full opacity-40 pointer-events-none" />
          <div className="relative max-w-2xl">
            <h2 id="cta-title" className="font-display text-3xl md:text-4xl font-bold">{t('landing.final.title', 'Ready to send your first request?')}</h2>
            <p className="mt-3 text-[#D7E8DE] text-[16px] leading-relaxed">
              {t('landing.final.sub', 'Verify your mobile number, tell us what you need, and we will come back with a quotation.')}
            </p>
            <button
              onClick={() => navigate(buyerHref)}
              className="mt-7 min-h-[52px] px-7 rounded-xl bg-canvas text-primary-deep font-bold text-[15.5px] inline-flex items-center gap-2 hover:bg-white transition-colors"
            >
              {currentBuyer ? t('landing.cta.account', 'Go to my account') : t('landing.cta.buyer', 'Continue as Buyer')}
              <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer id="contact" className="bg-primary-deep text-white scroll-mt-4">
        <div className="text-[#CFE5D8]/70"><WeaveBand /></div>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/75">
              {settings?.tagline || t('landing.eyebrow', 'Local Products. Easy Requests.')}
            </p>
            <div className="mt-5"><LanguageSwitcher tone="light" /></div>
          </div>

          <nav aria-label={t('landing.footer.nav', 'Footer')}>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">{t('landing.footer.explore', 'Explore')}</h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              <li><Link className="text-white/85 hover:text-white" to={buyerHref}>{t('landing.cta.buyer', 'Continue as Buyer')}</Link></li>
              <li><a className="text-white/85 hover:text-white" href="#categories">{t('landing.nav.categories', 'Categories')}</a></li>
              <li><a className="text-white/85 hover:text-white" href="#how">{t('landing.nav.how', 'How it works')}</a></li>
              <li><Link className="text-white/85 hover:text-white" to="/admin/login">{t('landing.admin', 'Admin')}</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">{t('landing.footer.contact', 'Contact')}</h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              {settings?.phone && (
                <li><a className="inline-flex items-center gap-2 text-white/85 hover:text-white" href={`tel:${settings.phone.replace(/\s/g, '')}`}><Phone className="w-4 h-4" aria-hidden="true" />{settings.phone}</a></li>
              )}
              {settings?.email && (
                <li><a className="inline-flex items-center gap-2 text-white/85 hover:text-white break-all" href={`mailto:${settings.email}`}><Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />{settings.email}</a></li>
              )}
              {settings?.operatingArea && (
                <li className="inline-flex items-center gap-2 text-white/75"><MapPin className="w-4 h-4" aria-hidden="true" />{settings.operatingArea}</li>
              )}
              {!settings && <li className="text-white/60">{t('landing.footer.nocontact', 'Contact details will appear here.')}</li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="max-w-7xl mx-auto px-5 md:px-8 py-5 text-[12.5px] text-white/60">
            © {new Date().getFullYear()} MZ Source
          </p>
        </div>
      </footer>
    </div>
  );
}
