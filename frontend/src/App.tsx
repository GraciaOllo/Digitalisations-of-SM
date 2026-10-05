import { FormEvent, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, FileText, Users, Package, BriefcaseBusiness,
  Globe, ShoppingBag, Menu, X, Bell, Moon, Sun,
  ArrowUpRight, WalletCards, Sparkles, Rocket, MonitorSmartphone,
  BadgeCheck, TrendingUp, Languages, Check, ClipboardList, UserRound, Save
} from 'lucide-react';

import BillingList from './pages/billing/BillingList';
import InvoiceDetail from './pages/billing/InvoiceDetail';
import PaymentNotFound from './pages/payment/PaymentNotFound';
import CRMPage from './pages/customers/CRMPage';
import StockPage from './pages/stock/StockPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import LiveBillingList from './pages/billing/LiveBillingList';
import InvoiceCreate from './pages/billing/InvoiceCreate';
import LiveInvoiceDetail from './pages/billing/LiveInvoiceDetail';
import AuthPage from './pages/auth/AuthPage';
import LandingPage from './pages/landing/LandingPage';
import OperationsPage from './pages/operations/OperationsPage';
import { useAuthStore } from './stores/auth.store';
import { api } from './lib/api';

const nav = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'invoices', path: '/billing', icon: FileText },
  { key: 'customers', path: '/customers', icon: Users },
  { key: 'stock', path: '/stock', icon: Package },
  { key: 'employees', path: '/employees', icon: BriefcaseBusiness },
  { key: 'operations', path: '/operations', icon: ClipboardList },
  { key: 'websites', path: '/websites', icon: Globe },
  { key: 'ecommerce', path: '/ecommerce', icon: ShoppingBag },
] as const;

function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language.startsWith('fr');

  return (
    <button
      onClick={() => i18n.changeLanguage(isFrench ? 'en' : 'fr')}
      title={isFrench ? 'Switch to English' : 'Passer en français'}
      aria-label={isFrench ? 'Switch to English' : 'Passer en français'}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${className}`}
    >
      <Languages size={15} />
      {isFrench ? 'EN' : 'FR'}
    </button>
  );
}

function DashboardHome() {
  const { t } = useTranslation();

  const stats = [
    { label: t('revenue'), value: '4 850 000 FCFA', delta: '+12.8%', icon: WalletCards },
    { label: t('invoices'), value: '128', delta: '+8.4%', icon: FileText },
    { label: t('customers'), value: '342', delta: '+18.2%', icon: Users },
    { label: t('stock'), value: '1 284', delta: `23 ${t('lowStock')}`, icon: Package },
  ];

  const websiteHighlights = [
    { title: t('showcaseWebsite'), detail: t('showcaseWebsiteText') },
    { title: t('showcaseStore'), detail: t('showcaseStoreText') },
    { title: t('showcasePortal'), detail: t('showcasePortalText') },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-teal-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-700 p-6 text-white shadow-[0_20px_60px_rgba(15,118,110,0.18)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-50">
              <Sparkles size={12} />
              Kôdo Growth OS
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{t('dashboardHeadline')}</h1>
            <p className="mt-3 max-w-xl text-sm text-teal-50/90 md:text-base">
              {t('dashboardDescription')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink to="/billing/invoices/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-teal-700 shadow-sm transition hover:translate-y-[-1px]">
                {t('newInvoice')}
              </NavLink>
              <NavLink to="/websites" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                {t('createWebsite')}
              </NavLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            {[
              ['+24.6%', t('growth')],
              ['4.89M XAF', t('receipts')],
              ['99.2%', t('satisfaction')],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xl font-black">{value}</div>
                <div className="mt-1 text-xs text-teal-50/80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{s.label}</span>
              <s.icon size={18} className="text-teal-600" />
            </div>
            <div className="mt-3 text-2xl font-black tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs font-medium text-teal-700">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('transactions')}</p>
              <h2 className="mt-1 text-xl font-black">{t('recentInvoices')}</h2>
            </div>
            <NavLink to="/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-600">
              {t('view')} <ArrowUpRight size={16} />
            </NavLink>
          </div>

          <div className="space-y-3">
            {[
              ['INV-2026-000001', 'Entreprise ABC', '250 000 FCFA', 'paid'],
              ['QUO-2026-000003', 'Boutique Soleil', '180 000 FCFA', 'sent'],
              ['INV-2026-000002', 'Restaurant Le Bistrot', '95 000 FCFA', 'overdue'],
            ].map(([num, client, amount, status]) => (
              <div key={num} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div>
                  <div className="font-semibold text-sm">{num}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{client}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{amount}</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">{t(status === 'paid' ? 'paidStatus' : status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('actions')}</p>
              <h2 className="mt-1 text-xl font-black">{t('quickActions')}</h2>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </div>
          <div className="mt-5 grid gap-3">
            {[
              [FileText, t('newInvoice'), '/billing/invoices/new'],
              [Users, t('addCustomer'), '/customers'],
              [Package, t('addProduct'), '/stock'],
              [Globe, t('createWebsite'), '/websites'],
            ].map(([Icon, label, path]) => (
              <NavLink
                key={label as string}
                to={path as string}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-teal-800 dark:hover:bg-slate-800"
              >
                <Icon size={18} className="text-teal-600" />
                {label as string}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('service')}</p>
              <h2 className="mt-1 text-xl font-black">{t('websiteMarketing')}</h2>
            </div>
            <Rocket size={18} className="text-teal-600" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {websiteHighlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-3 inline-flex rounded-xl bg-teal-100 p-2 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <MonitorSmartphone size={18} />
                </div>
                <div className="font-bold">{item.title}</div>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm dark:border-teal-900 dark:from-teal-950/40 dark:to-slate-900">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            <TrendingUp size={12} />
            {t('growth')}
          </div>
          <h3 className="text-xl font-black">{t('webPresenceTitle')}</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-teal-700" /> {t('premiumDesign')}</li>
            <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-teal-700" /> {t('fastLaunch')}</li>
            <li className="flex items-center gap-2"><BadgeCheck size={16} className="text-teal-700" /> {t('leadManagement')}</li>
          </ul>
          <NavLink to="/websites" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300">
            {t('viewOffer')} <ArrowUpRight size={16} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function BusinessModulePage({ title, subtitle, items, highlight }: { title: string; subtitle: string; items: string[]; highlight: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('module')}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">{highlight}</div>
        </div>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 h-10 w-10 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center">
              <BadgeCheck size={18} />
            </div>
            <h3 className="font-bold">{item}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('moduleDescription')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteCreationPage() {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language.startsWith('en');
  const [project, setProject] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kodo-website-project') || 'null') as WebsiteProject | null;
    } catch {
      return null;
    }
  });
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<WebsiteProject>(project || {
    businessName: '',
    industry: '',
    siteType: 'showcase',
    objective: '',
    description: '',
    email: '',
    phone: '',
    domain: '',
  });
  const hasPreview = Boolean(form.businessName || form.industry || form.description || form.domain || form.email || form.phone);
  const siteTypeLabels: Record<string, string> = {
    showcase: isEnglish ? 'Business website' : 'Site vitrine',
    landing: isEnglish ? 'Landing page' : 'Page de vente',
    store: isEnglish ? 'Online store' : 'Boutique en ligne',
    portfolio: 'Portfolio',
  };
  const objectiveLabels: Record<string, string> = {
    leads: isEnglish ? 'Get more enquiries' : 'Recevoir plus de demandes',
    sales: isEnglish ? 'Sell online' : 'Vendre en ligne',
    presence: isEnglish ? 'Build an online presence' : 'Développer ma présence en ligne',
    booking: isEnglish ? 'Get bookings' : 'Obtenir des réservations',
  };

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('kodo-website-project', JSON.stringify(form));
    setProject(form);
    setSaved(true);
  }

  function updateForm(field: keyof WebsiteProject, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{isEnglish ? 'Digital studio' : 'Studio digital'}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{isEnglish ? 'Create your website' : 'Créez votre site web'}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {isEnglish ? 'Tell us what your business needs. Your brief is saved on this device so you can continue later.' : 'Décrivez le site dont votre activité a besoin. Votre brief est enregistré sur cet appareil pour être repris plus tard.'}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <form onSubmit={saveProject} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Business name' : 'Nom de l’entreprise'}
              <input required className="field w-full" value={form.businessName} onChange={event => updateForm('businessName', event.target.value)} placeholder={isEnglish ? 'e.g. Kôdo Studio' : 'Ex. Kôdo Studio'} />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Industry' : 'Secteur d’activité'}
              <input required className="field w-full" value={form.industry} onChange={event => updateForm('industry', event.target.value)} placeholder={isEnglish ? 'e.g. Consulting' : 'Ex. Conseil'} />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Website type' : 'Type de site'}
              <select className="field w-full" value={form.siteType} onChange={event => updateForm('siteType', event.target.value)}>
                <option value="showcase">{isEnglish ? 'Business website' : 'Site vitrine'}</option>
                <option value="landing">{isEnglish ? 'Landing page' : 'Page de vente'}</option>
                <option value="store">{isEnglish ? 'Online store' : 'Boutique en ligne'}</option>
                <option value="portfolio">{isEnglish ? 'Portfolio' : 'Portfolio'}</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Main objective' : 'Objectif principal'}
              <select required className="field w-full" value={form.objective} onChange={event => updateForm('objective', event.target.value)}>
                <option value="">{isEnglish ? 'Choose an objective' : 'Choisir un objectif'}</option>
                <option value="leads">{isEnglish ? 'Get more enquiries' : 'Recevoir plus de demandes'}</option>
                <option value="sales">{isEnglish ? 'Sell online' : 'Vendre en ligne'}</option>
                <option value="presence">{isEnglish ? 'Build an online presence' : 'Développer ma présence en ligne'}</option>
                <option value="booking">{isEnglish ? 'Get bookings' : 'Obtenir des réservations'}</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Contact email' : 'E-mail de contact'}
              <input type="email" className="field w-full" value={form.email} onChange={event => updateForm('email', event.target.value)} placeholder="contact@example.com" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">{isEnglish ? 'Phone number' : 'Téléphone'}
              <input type="tel" className="field w-full" value={form.phone} onChange={event => updateForm('phone', event.target.value)} placeholder="+237 6XX XX XX XX" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold sm:col-span-2">{isEnglish ? 'Preferred domain (optional)' : 'Nom de domaine souhaité (facultatif)'}
              <input className="field w-full" value={form.domain} onChange={event => updateForm('domain', event.target.value)} placeholder="www.example.com" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold sm:col-span-2">{isEnglish ? 'Describe your business and the content you need' : 'Décrivez votre activité et les contenus souhaités'}
              <textarea required rows={5} className="field w-full resize-y" value={form.description} onChange={event => updateForm('description', event.target.value)} placeholder={isEnglish ? 'Your services, audience, pages, style...' : 'Vos services, votre clientèle, les pages et le style souhaités...'} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"><Check size={16} />{isEnglish ? 'Save website brief' : 'Enregistrer le brief'}</button>
            {saved && <span role="status" className="text-sm font-medium text-teal-800 dark:text-teal-300">{t('websiteCreated')}</span>}
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold"><MonitorSmartphone size={17} className="text-teal-700" />{isEnglish ? 'Project preview' : 'Aperçu du projet'}</div>
          {hasPreview ? <div className="space-y-4">
            <div className="rounded-xl bg-slate-950 p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-widest text-teal-300">{form.industry || (isEnglish ? 'Your industry' : 'Votre secteur')}</div>
              <h2 className="mt-3 text-2xl font-black">{form.businessName || (isEnglish ? 'Your business' : 'Votre entreprise')}</h2>
              <p className="mt-2 line-clamp-4 text-sm text-slate-300">{form.description || (isEnglish ? 'Your business description will appear here.' : 'La description de votre activité apparaîtra ici.')}</p>
              <div className="mt-5 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900">{isEnglish ? 'Get in touch' : 'Nous contacter'}</div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">{t('websiteType')}</dt><dd className="font-semibold">{siteTypeLabels[form.siteType]}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">{isEnglish ? 'Objective' : 'Objectif'}</dt><dd className="font-semibold">{objectiveLabels[form.objective] || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">{isEnglish ? 'Domain' : 'Domaine'}</dt><dd className="font-semibold">{form.domain || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">{t('contact')}</dt><dd className="font-semibold">{form.email || form.phone || '—'}</dd></div>
            </dl>
            <p className="border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500 dark:border-slate-700">{isEnglish ? 'This live preview is a saved project brief, not a published website.' : 'Cet aperçu en direct constitue un brief enregistré, pas un site publié.'}</p>
          </div> : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">{isEnglish ? 'Complete the form to see your project preview here.' : 'Remplissez le formulaire pour afficher l’aperçu de votre projet.'}</div>}
        </aside>
      </div>
    </div>
  );
}

type WebsiteProject = {
  businessName: string;
  industry: string;
  siteType: string;
  objective: string;
  description: string;
  email: string;
  phone: string;
  domain: string;
};

type ProfileForm = { firstName: string; lastName: string; email: string; phone: string };

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<ProfileForm>('/employees/me')
      .then((profile) => {
        setForm({ ...profile, phone: profile.phone || '' });
        updateUser(profile);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : t('error')));
  }, [t, updateUser]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const profile = await api<ProfileForm>('/employees/me', {
        method: 'PATCH',
        body: JSON.stringify({ ...form, email: form.email.trim() }),
      });
      updateUser(profile);
      setForm({ ...profile, phone: profile.phone || '' });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('profile')}</p>
            <h2 id="profile-title" className="mt-1 text-2xl font-black">{t('editProfile')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">{t('firstName')}<input required className="field w-full" value={form.firstName} onChange={(event) => { setForm({ ...form, firstName: event.target.value }); setSaved(false); }} /></label>
            <label className="space-y-1.5 text-sm font-semibold">{t('lastName')}<input required className="field w-full" value={form.lastName} onChange={(event) => { setForm({ ...form, lastName: event.target.value }); setSaved(false); }} /></label>
          </div>
          <label className="block space-y-1.5 text-sm font-semibold">{t('email')}<input required type="email" className="field w-full" value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); setSaved(false); }} /></label>
          <label className="block space-y-1.5 text-sm font-semibold">{t('phone')}<input type="tel" className="field w-full" value={form.phone} onChange={(event) => { setForm({ ...form, phone: event.target.value }); setSaved(false); }} /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {saved && <p role="status" className="text-sm font-semibold text-teal-800 dark:text-teal-300">{t('profileSaved')}</p>}
          <div className="flex justify-end">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"><Save size={16} />{saving ? t('loading') : t('saveProfile')}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AppLayout() {
  const { t } = useTranslation();
  const { accessToken, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCurrency, setCompanyCurrency] = useState('XAF');
  const location = useLocation();

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    api<{ name: string; currency: string }>('/companies/current')
      .then((company) => {
        if (!active) return;
        setCompanyName(company.name);
        setCompanyCurrency(company.currency);
      })
      .catch(() => {
        if (active) setCompanyName(t('companyUnavailable'));
      });
    return () => { active = false; };
  }, [accessToken, t]);

  if (!accessToken || !user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/payment')) {
    return (
      <Routes>
        <Route path="/payment/not-found" element={<PaymentNotFound />} />
      </Routes>
    );
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen">
          <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex h-20 items-center justify-between px-6">
              <div>
                <div className="text-2xl font-black tracking-tight">Kôdo<span className="text-emerald-500">.</span></div>
                <div className="text-[11px] font-medium text-slate-400">{t('tagline')}</div>
              </div>
              <button className="lg:hidden" onClick={() => setOpen(false)}><X size={22} /></button>
            </div>

            <div className="px-4">
              <div className="mb-6 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-400">{t('companyLabel')}</div>
                <div className="mt-1 break-words font-semibold">{companyName || t('loadingCompany')}</div>
                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                  <div className="mt-0.5 break-all text-xs text-slate-500">{user?.email}</div>
                  <div className="mt-1 text-xs text-slate-500">{companyCurrency}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {nav.map(({ key, path, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {key === 'invoices' ? t('billing') : key === 'websites' ? t('websites') : t(key)}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex flex-1 flex-col min-w-0">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
              <button className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <LanguageToggle />
                <button
                  onClick={() => setProfileOpen(true)}
                  title={t('editProfile')}
                  aria-label={t('editProfile')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700"
                >
                  <UserRound size={16} />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                <button
                  onClick={() => setDark(!dark)}
                  className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                  <Bell size={16} />
                </button>
                <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700">
                  {t('logout')}
                </button>
              </div>
            </header>

            <main className="flex-1 p-4 lg:p-8">
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/billing" element={<LiveBillingList />} />
                <Route path="/billing/quotes" element={<LiveBillingList />} />
                <Route path="/billing/invoices" element={<LiveBillingList />} />
                <Route path="/billing/credit-notes" element={<LiveBillingList />} />
                <Route path="/billing/invoices/new" element={<InvoiceCreate />} />
                <Route path="/billing/invoices/:id" element={<LiveInvoiceDetail />} />
                <Route path="/customers" element={<CRMPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/operations" element={<OperationsPage />} />
                <Route path="/websites" element={<WebsiteCreationPage />} />
                <Route path="/ecommerce" element={<BusinessModulePage title={t('ecommerceTitle')} subtitle={t('ecommerceSubtitle')} highlight={t('ecommerceHighlight')} items={[t('ecommerceCatalog'), t('ecommerceOrders'), t('ecommercePromotions'), t('ecommercePayments'), t('ecommerceInventory'), t('ecommerceCampaigns')]} />} />
                <Route path="/payment/not-found" element={<PaymentNotFound />} />
              </Routes>
              {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
