import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { api } from "../../lib/api";

type Invoice = {
  number: string;
  status: string;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  notes?: string;
  customerId?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }[];
};

const money = (n: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(n);

export default function LiveInvoiceDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      api<Invoice>(`/invoicing/${id}`)
        .then(setInvoice)
        .catch((e) => setError(e.message));
    }
  }, [id]);

  if (error)
    return <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>;
  if (!invoice)
    return (
      <div className="py-20 text-center text-slate-400">{t("loading")}</div>
    );

  const handleDownload = () => {
    document.title = `${invoice.number} - ${t("downloadReceipt")}`;
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="no-print flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/billing"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-sm text-slate-500">{t("document")}</p>
            <h1 className="text-2xl font-black">{invoice.number}</h1>
          </div>
        </div>
      </div>

      <div className="receipt-print rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-2xl font-black">
            Kôdo<span className="text-emerald-500">.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {t(invoice.status === "paid" ? "paidStatus" : invoice.status)}
            </span>
            <button
              onClick={handleDownload}
              className="no-print inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              <Download size={16} />
              {t("downloadReceipt")}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label">{t("client")}</p>
            <p className="font-bold">{invoice.customerId?.name}</p>
            <p className="text-sm text-slate-500">
              {invoice.customerId?.email}
            </p>
            <p className="text-sm text-slate-500">
              {invoice.customerId?.phone}
            </p>
          </div>
          <div className="text-sm sm:text-right">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-slate-500">{t("registrationNumber")}</p>
              <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                {invoice.number}
              </p>
            </div>
            <p className="mt-3">
              {t("issueDate")} : {new Date(invoice.issueDate).toLocaleDateString(i18n.language === "en" ? "en-CM" : "fr-FR")}
            </p>
            {invoice.dueDate && (
              <p>
                {t("dueDate")} :{" "}
                {new Date(invoice.dueDate).toLocaleDateString(i18n.language === "en" ? "en-CM" : "fr-FR")}
              </p>
            )}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
            <tr>
              <th className="py-3">{t("description")}</th>
              <th className="py-3 text-right">{t("quantityShort")}</th>
              <th className="py-3 text-right">{t("unitShort")}</th>
              <th className="py-3 text-right">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{money(item.unitPrice, i18n.language === "en" ? "en-CM" : "fr-CM")}</td>
                <td className="py-3 text-right">{money(item.total, i18n.language === "en" ? "en-CM" : "fr-CM")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t("subtotal")}</span>
            <span>{money(invoice.subtotal, i18n.language === "en" ? "en-CM" : "fr-CM")}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA</span>
            <span>{money(invoice.taxTotal, i18n.language === "en" ? "en-CM" : "fr-CM")}</span>
          </div>
          <div className="flex justify-between text-base font-black">
            <span>Total</span>
            <span>{money(invoice.total, i18n.language === "en" ? "en-CM" : "fr-CM")}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <p className="font-bold">{t("notes")}</p>
            <p className="mt-2">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800">
          <p>{t("receiptGenerated")} • {t("registrationNumber")}: {invoice.number}</p>
        </div>
      </div>
    </div>
  );
}
