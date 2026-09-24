import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, FileText, Users, Package, BriefcaseBusiness,
  FolderKanban, ShoppingBag, Menu, X, Bell, Moon, Sun,
  ArrowUpRight, WalletCards
} from 'lucide-react';

import BillingList from './pages/billing/BillingList';
import InvoiceDetail from './pages/billing/InvoiceDetail';
import PaymentNotFound from './pages/payment/PaymentNotFound';
import CustomersPage from './pages/customers/CustomersPage';
import StockPage from './pages/stock/StockPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import LiveBillingList from './pages/billing/LiveBillingList';
import InvoiceCreate from './pages/billing/InvoiceCreate';
import LiveInvoiceDetail from './pages/billing/LiveInvoiceDetail';
import AuthPage from './pages/auth/AuthPage';
import { useAuthStore } from './stores/auth.store';

const nav = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'invoices', path: '/billing', icon: FileText },
  { key: 'customers', path: '/customers', icon: Users },
  { key: 'stock', path: '/stock', icon: Package },
  { key: 'employees', path: '/employees', icon: BriefcaseBusiness },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'ecommerce', path: '/ecommerce', icon: ShoppingBag },
] as const;

function DashboardHome() {
  const { t } = useTranslation();

  const stats = [
    { label: t('revenue'), value: '4 850 000 FCFA', delta: '+12.8%', icon: WalletCards },
    { label: t('invoices'), value: '128', delta: '+8.4%', icon: FileText },
    { label: t('customers'), value: '342', delta: '+18.2%', icon: Users },
    { label: t('stock'), value: '1 284', delta: '23 low', icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('welcome')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('overview')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <s.icon size={18} className="text-emerald-500" />
            </div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs font-medium text-emerald-600">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">{t('recentInvoices')}</h2>
            <NavLink to="/billing" className="text-sm font-medium text-emerald-600 hover:underline">
              {t('view')} →
            </NavLink>
          </div>
          <div className="space-y-3">
            {[
              ['INV-2026-000001', 'Entreprise ABC', '250 000 FCFA', 'paid'],
              ['QUO-2026-000003', 'Boutique Soleil', '180 000 FCFA', 'sent'],
              ['INV-2026-000002', 'Restaurant Le Bistrot', '95 000 FCFA', 'overdue'],
            ].map(([num, client, amount, status]) => (
              <div key={num} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <div>
                  <div className="font-medium text-sm">{num}</div>
                  <div className="text-xs text-slate-500">{client}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{amount}</div>
                  <div className="text-xs text-slate-400">{status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{t('quickActions')}</h2>
            <ArrowUpRight size={18} className="text-slate-400" />
          </div>
          <div className="mt-5 grid gap-3">
            {[
              [FileText, t('newInvoice'), '/billing/invoices/new'],
              [Users, t('addCustomer'), '/customers'],
              [Package, t('addProduct'), '/stock'],
            ].map(([Icon, label, path]) => (
              <NavLink
                key={label as string}
                to={path as string}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Icon size={18} className="text-emerald-500" />
                {label as string}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-sm mt-2">Module coming soon</p>
    </div>
  );
}

function AppLayout() {
  const { t, i18n } = useTranslation();
  const { accessToken, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  if (!accessToken || !user) return <Routes><Route path="*" element={<AuthPage />} /></Routes>;

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
                <div className="text-[11px] font-medium text-slate-400">SME OPERATING SYSTEM</div>
              </div>
              <button className="lg:hidden" onClick={() => setOpen(false)}><X size={22} /></button>
            </div>

            <div className="px-4">
              <div className="mb-6 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-400">COMPANY</div>
                <div className="mt-1 font-semibold">Demo Cameroon SARL</div>
                <div className="mt-1 text-xs text-slate-500">Yaoundé · XAF</div>
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
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {key === 'invoices' ? t('billing') : t(key)}
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
                <button
                  onClick={toggleLanguage}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                >
                  {i18n.language === 'fr' ? 'EN' : 'FR'}
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
                  Déconnexion
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
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/projects" element={<Placeholder title={t('projects')} />} />
                <Route path="/ecommerce" element={<Placeholder title={t('ecommerce')} />} />
                <Route path="/payment/not-found" element={<PaymentNotFound />} />
              </Routes>
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
