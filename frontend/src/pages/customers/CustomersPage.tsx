import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Search, Trash2, Users } from 'lucide-react';

type Customer = { _id: string; name: string; email?: string; phone?: string; city?: string; type?: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', type: 'company' });
  const [error, setError] = useState('');

  const load = () => api<Customer[]>('/invoicing/customers').then(setCustomers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    try { await api('/invoicing/customers', { method: 'POST', body: JSON.stringify(form) }); setForm({ name: '', email: '', phone: '', city: '', type: 'company' }); setFormOpen(false); load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
  }
  async function remove(id: string) { if (!confirm('Supprimer ce client ?')) return; await api(`/invoicing/customers/${id}`, { method: 'DELETE' }); load(); }
  const filtered = customers.filter((c) => `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">CRM</p><h1 className="text-3xl font-black">Clients</h1><p className="mt-1 text-slate-500">Centralisez vos relations et vos coordonnées.</p></div><button onClick={() => setFormOpen(!formOpen)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Nouveau client</button></div>
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {formOpen && <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"><input required placeholder="Nom du client" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field" /><input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="field" /><input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="field" /><input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="field" /><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field"><option value="company">Entreprise</option><option value="individual">Particulier</option></select><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Enregistrer</button></form>}
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="field w-full pl-10" /></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Type</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody>{filtered.map(c => <tr key={c._id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4"><div className="font-bold">{c.name}</div><div className="text-xs text-slate-500">{c.city || 'Ville non renseignée'}</div></td><td className="px-5 py-4 text-slate-500">{c.email || c.phone || 'Aucun contact'}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{c.type === 'individual' ? 'Particulier' : 'Entreprise'}</span></td><td className="px-5 py-4 text-right"><button title="Supprimer" onClick={() => remove(c._id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={4} className="px-5 py-16 text-center text-slate-400"><Users className="mx-auto mb-2" />Aucun client</td></tr>}</tbody></table></div>
  </div>;
}
