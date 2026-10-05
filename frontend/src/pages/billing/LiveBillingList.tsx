import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, FileText, Plus, Search } from "lucide-react";
import { api } from "../../lib/api";

type Document = {
  _id: string;
  number: string;
  type: string;
  status: string;
  issueDate: string;
  total: number;
  customerId?: { name: string };
};
const money = (n: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(n);
export default function LiveBillingList() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const [docs, setDocs] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const type = params.get("type");
  const [error, setError] = useState("");
  useEffect(() => {
    const query =
      type && type !== "all"
        ? `?type=${type === "quotes" ? "quote" : type === "credit-notes" ? "credit_note" : "invoice"}`
        : "";
    api<{ data: Document[] }>(`/invoicing${query}`)
      .then((r) => setDocs(r.data))
      .catch((e) => setError(e.message));
  }, [type]);
  const filtered = docs.filter((d) =>
    `${d.number} ${d.customerId?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            {t("finance")}
          </p>
          <h1 className="text-3xl font-black">{t("billing")}</h1>
          <p className="mt-1 text-slate-500">{t("billingIntro")}</p>
        </div>
        <Link
          to="/billing/invoices/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus size={17} /> {t("createInvoiceAction")}
        </Link>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto">
        {[
          ["all", t("all")],
          ["invoices", t("invoicesTab")],
          ["quotes", t("quotesTab")],
          ["credit-notes", t("creditNotesTab")],
        ].map(([key, label]) => (
          <Link
            key={key}
            to={key === "all" ? "/billing" : `/billing?type=${key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${(type || "all") === key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchDocuments")}
          className="field w-full pl-10"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-5 py-4">{t("number")}</th>
              <th className="px-5 py-4">{t("client")}</th>
              <th className="px-5 py-4">{t("date")}</th>
              <th className="px-5 py-4">{t("amount")}</th>
              <th className="px-5 py-4">{t("status")}</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d._id}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="px-5 py-4 font-bold">{d.number}</td>
                <td className="px-5 py-4">
                  {d.customerId?.name || t("clientDeleted")}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(d.issueDate).toLocaleDateString(i18n.language === "en" ? "en-CM" : "fr-FR")}
                </td>
                <td className="px-5 py-4 font-semibold">{money(d.total, i18n.language === "en" ? "en-CM" : "fr-CM")}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-slate-800">
                    {t(d.status === "paid" ? "paidStatus" : d.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/billing/invoices/${d._id}`}
                    className="text-emerald-600"
                  >
                    <Eye size={17} />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-slate-400"
                >
                  <FileText className="mx-auto mb-2" />
                  {t("noDocumentsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
