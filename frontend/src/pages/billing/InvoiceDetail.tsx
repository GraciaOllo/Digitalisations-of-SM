import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, CreditCard } from 'lucide-react';

// Mock detail
const mockInvoice = {
  id: '1',
  number: 'INV-2026-000001',
  type: 'invoice',
  status: 'sent',
  issueDate: '2026-09-20',
  dueDate: '2026-10-20',
  client: {
    name: 'Entreprise ABC SARL',
    email: 'contact@abc.cm',
    phone: '+237 690 00 00 00',
    address: 'Rue de la Réunification, Yaoundé',
  },
  items: [
    { description: 'Développement site web', quantity: 1, unitPrice: 350000, taxRate: 19.25, subtotal: 350000, taxAmount: 67375, total: 417375 },
    { description: 'Hébergement annuel', quantity: 1, unitPrice: 50000, taxRate: 19.25, subtotal: 50000, taxAmount: 9625, total: 59625 },
  ],
  subtotal: 400000,
  taxTotal: 77000,
  total: 477000,
  notes: 'Merci pour votre confiance.',
  terms: 'Paiement sous 30 jours.',
};

export default function InvoiceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

  const handlePay = () => {
    navigate('/payment/not-found');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/billing" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{mockInvoice.number}</h1>
            <p className="text-sm text-slate-500">{t('invoices')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download size={16} /> {t('downloadPdf')}
          </button>
          <button
            onClick={handlePay}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <CreditCard size={16} /> {t('pay')}
          </button>
        </div>
      </div>

      {/* Document card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="text-2xl font-black">Kôdo<span className="text-emerald-500">.</span></div>
            <div className="text-xs text-slate-400 mt-1">SME OPERATING SYSTEM</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{mockInvoice.number}</div>
            <div className="text-sm text-slate-500 mt-1">{t('date')}: {mockInvoice.issueDate}</div>
            <div className="text-sm text-slate-500">{t('dueDate')}: {mockInvoice.dueDate}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{t('client')}</div>
            <div className="font-semibold">{mockInvoice.client.name}</div>
            <div className="text-sm text-slate-500">{mockInvoice.client.email}</div>
            <div className="text-sm text-slate-500">{mockInvoice.client.phone}</div>
            <div className="text-sm text-slate-500">{mockInvoice.client.address}</div>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Qté</th>
                <th className="py-2 pr-4 text-right">P.U.</th>
                <th className="py-2 pr-4 text-right">TVA</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoice.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4">{item.description}</td>
                  <td className="py-3 pr-4 text-right">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right">{formatFCFA(item.unitPrice)}</td>
                  <td className="py-3 pr-4 text-right">{item.taxRate}%</td>
                  <td className="py-3 text-right font-medium">{formatFCFA(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('subtotal')}</span>
              <span>{formatFCFA(mockInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('tax')}</span>
              <span>{formatFCFA(mockInvoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>{t('total')}</span>
              <span className="text-emerald-600">{formatFCFA(mockInvoice.total)}</span>
            </div>
          </div>
        </div>

        {mockInvoice.notes && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{t('notes')}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{mockInvoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
