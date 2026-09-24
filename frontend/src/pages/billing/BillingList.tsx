import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Search, Eye } from 'lucide-react';

// Mock data for preview (will be replaced by API calls)
const mockDocs = [
  { id: '1', number: 'INV-2026-000001', type: 'invoice', client: 'Entreprise ABC', date: '2026-09-20', total: 250000, status: 'paid' },
  { id: '2', number: 'QUO-2026-000003', type: 'quote', client: 'Boutique Soleil', date: '2026-09-18', total: 180000, status: 'sent' },
  { id: '3', number: 'INV-2026-000002', type: 'invoice', client: 'Restaurant Le Bistrot', date: '2026-09-15', total: 95000, status: 'overdue' },
  { id: '4', number: 'CN-2026-000001', type: 'credit_note', client: 'Entreprise ABC', date: '2026-09-12', total: 25000, status: 'paid' },
  { id: '5', number: 'INV-2026-000003', type: 'invoice', client: 'Clinique Santé+', date: '2026-09-10', total: 420000, status: 'partially_paid' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  partially_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

export default function BillingList() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || 'all';
  const [search, setSearch] = useState('');

  const filtered = mockDocs.filter((d) => {
    const matchType =
      typeFilter === 'all' ||
      (typeFilter === 'quotes' && d.type === 'quote') ||
      (typeFilter === 'invoices' && d.type === 'invoice') ||
      (typeFilter === 'credit-notes' && d.type === 'credit_note');
    const matchSearch =
      !search ||
      d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('billing')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {typeFilter === 'quotes' && t('quotes')}
            {typeFilter === 'invoices' && t('invoices')}
            {typeFilter === 'credit-notes' && t('creditNotes')}
            {typeFilter === 'all' && t('allDocuments')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/billing/invoices/new?type=quote"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus size={16} /> {t('createQuote')}
          </Link>
          <Link
            to="/billing/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={16} /> {t('createInvoice')}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: t('allDocuments') },
          { key: 'invoices', label: t('invoices') },
          { key: 'quotes', label: t('quotes') },
          { key: 'credit-notes', label: t('creditNotes') },
        ].map((tab) => (
          <Link
            key={tab.key}
            to={tab.key === 'all' ? '/billing' : `/billing?type=${tab.key}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              typeFilter === tab.key
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">{t('number')}</th>
                <th className="px-4 py-3 font-medium">{t('client')}</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">{t('date')}</th>
                <th className="px-4 py-3 font-medium">{t('amount')}</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
                <th className="px-4 py-3 font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    {t('noDocuments')}
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">{doc.number}</td>
                    <td className="px-4 py-3">{doc.client}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{doc.date}</td>
                    <td className="px-4 py-3 font-semibold">{formatFCFA(doc.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[doc.status]}`}>
                        {t(doc.status === 'paid' ? 'paidStatus' : doc.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/billing/invoices/${doc.id}`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:underline text-xs font-medium"
                      >
                        <Eye size={14} /> {t('view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
