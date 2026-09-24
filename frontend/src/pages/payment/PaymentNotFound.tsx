import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CreditCard className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('paymentComingSoonTitle')}
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {t('paymentComingSoonDesc')}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            <ArrowLeft size={16} />
            {t('backToInvoice')}
          </button>

          <Link
            to="/billing"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t('billing')}
          </Link>
        </div>
      </div>
    </div>
  );
}
