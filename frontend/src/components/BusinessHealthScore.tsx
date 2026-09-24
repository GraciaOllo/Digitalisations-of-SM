import { useTranslation } from 'react-i18next';

interface Props {
score: number;
label: string;
color: 'emerald' | 'blue' | 'amber' | 'red';
overdueInvoices: number;
unpaidAmount: number;
}

export default function BusinessHealthScore({ score, label, color, overdueInvoices, unpaidAmount }: Props) {
const { t, i18n } = useTranslation();

const colorMap = {
emerald: 'from-emerald-500 to-emerald-600',
blue: 'from-blue-500 to-blue-600',
amber: 'from-amber-500 to-amber-600',
red: 'from-red-500 to-red-600',
};

const formatFCFA = (n: number) =>
new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-CM' : 'en-CM', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
}).format(n);

return (
<div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">
        {i18n.language === 'fr' ? 'Santé de l\'entreprise' : 'Business Health'}
    </h3>
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-${color}-100 text-${color}-700 dark:bg-${color}-900/40`}>
        {label}
    </span>
    </div>

    <div className="flex items-end gap-4">
    <div className={`text-5xl font-black bg-gradient-to-br ${colorMap[color]} bg-clip-text text-transparent`}>
        {score}
    </div>
    <div className="text-slate-400 text-sm pb-1">/ 100</div>
    </div>

    <div className="mt-6 space-y-2 text-sm">
    <div className="flex justify-between">
        <span className="text-slate-500">{i18n.language === 'fr' ? 'Factures en retard' : 'Overdue invoices'}</span>
        <span className="font-semibold">{overdueInvoices}</span>
    </div>
    <div className="flex justify-between">
        <span className="text-slate-500">{i18n.language === 'fr' ? 'Montant impayé' : 'Unpaid amount'}</span>
        <span className="font-semibold text-red-500">{formatFCFA(unpaidAmount)}</span>
    </div>
    </div>
</div>
);
}