import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock, FileText, Mail, MessageSquare, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from '../../lib/api';
import LiveBillingList from '../billing/LiveBillingList';

type Customer = { _id: string; name: string; email?: string; phone?: string; city?: string; type?: string };
type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
type Lead = { _id: string; name: string; companyName?: string; email?: string; phone?: string; source?: string; stage: LeadStage; estimatedValue?: number; nextFollowUp?: string; notes?: string; customerId?: string };
type OrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type CRMOrder = { _id: string; customerId: string; customerName: string; number: string; description: string; total: number; status: OrderStatus; expectedAt?: string };
type Activity = { _id: string; type: string; content: string; createdAt: string };
type Template = { _id: string; name: string; channel: 'email' | 'sms'; subject?: string; body: string };
type Tab = 'customers' | 'leads' | 'orders' | 'messages' | 'billing';

const leadStages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const orderStatuses: OrderStatus[] = ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const leadStageKey: Record<LeadStage, string> = { new: 'stageNew', contacted: 'stageContacted', qualified: 'stageQualified', proposal: 'stageProposal', won: 'stageWon', lost: 'stageLost' };
const orderStatusKey: Record<OrderStatus, string> = { draft: 'orderDraft', confirmed: 'orderConfirmed', processing: 'orderProcessing', shipped: 'orderShipped', delivered: 'orderDelivered', cancelled: 'orderCancelled' };
const money = (amount: number, locale: string) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);

export default function CRMPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<CRMOrder[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', city: '', type: 'company' });
  const [leadForm, setLeadForm] = useState({ name: '', companyName: '', email: '', phone: '', source: '', estimatedValue: '', nextFollowUp: '', notes: '' });
  const [orderForm, setOrderForm] = useState({ customerId: '', description: '', total: '', expectedAt: '' });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityType, setActivityType] = useState('note');
  const [activityContent, setActivityContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', channel: 'email' as 'email' | 'sms', subject: '', body: '' });
  const [recipientId, setRecipientId] = useState('');

  async function loadData() {
    try {
      const [customerRows, leadRows, orderRows, templateRows] = await Promise.all([
        api<Customer[]>('/invoicing/customers'),
        api<Lead[]>('/crm/leads'),
        api<CRMOrder[]>('/crm/orders'),
        api<Template[]>('/crm/templates'),
      ]);
      setCustomers(customerRows);
      setLeads(leadRows);
      setOrders(orderRows);
      setTemplates(templateRows);
      const activeTemplate = selectedTemplate ? templateRows.find((entry) => entry._id === selectedTemplate._id) || selectedTemplate : templateRows[0] || null;
      setSelectedTemplate(activeTemplate);
      if (!selectedTemplate && activeTemplate) {
        setTemplateForm({ name: activeTemplate.name, channel: activeTemplate.channel, subject: activeTemplate.subject || '', body: activeTemplate.body });
      }
      setRecipientId((current) => current || customerRows[0]?._id || '');
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    }
  }

  useEffect(() => { void loadData(); }, []);

  const filteredCustomers = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.email || ''} ${customer.phone || ''} ${customer.city || ''}`.toLowerCase().includes(search.toLowerCase())), [customers, search]);
  const recipient = customers.find((customer) => customer._id === recipientId);
  const locale = i18n.language === 'en' ? 'en-CM' : 'fr-CM';
  const localizedDate = (value?: string) => value ? new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-CM' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : '';

  async function createCustomer(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = {
        name: customerForm.name.trim(),
        type: customerForm.type,
        ...(customerForm.email.trim() ? { email: customerForm.email.trim() } : {}),
        ...(customerForm.phone.trim() ? { phone: customerForm.phone.trim() } : {}),
        ...(customerForm.city.trim() ? { city: customerForm.city.trim() } : {}),
      };
      await api('/invoicing/customers', { method: 'POST', body: JSON.stringify(payload) });
      setCustomerForm({ name: '', email: '', phone: '', city: '', type: 'company' });
      setCustomerFormOpen(false);
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function removeCustomer(customer: Customer) {
    if (!window.confirm(t('deleteCustomerConfirm'))) return;
    try {
      await api(`/invoicing/customers/${customer._id}`, { method: 'DELETE' });
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function openHistory(customer: Customer) {
    setSelectedCustomer(customer);
    try { setActivities(await api<Activity[]>(`/crm/customers/${customer._id}/activity`)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function addActivity(event: FormEvent) {
    event.preventDefault();
    if (!selectedCustomer || !activityContent.trim()) return;
    try {
      await api(`/crm/customers/${selectedCustomer._id}/activity`, { method: 'POST', body: JSON.stringify({ type: activityType, content: activityContent.trim() }) });
      setActivityContent('');
      await openHistory(selectedCustomer);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function createLead(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = {
        name: leadForm.name.trim(),
        ...(leadForm.companyName.trim() ? { companyName: leadForm.companyName.trim() } : {}),
        ...(leadForm.email.trim() ? { email: leadForm.email.trim() } : {}),
        ...(leadForm.phone.trim() ? { phone: leadForm.phone.trim() } : {}),
        ...(leadForm.source.trim() ? { source: leadForm.source.trim() } : {}),
        ...(leadForm.estimatedValue ? { estimatedValue: Number(leadForm.estimatedValue) } : {}),
        ...(leadForm.nextFollowUp ? { nextFollowUp: new Date(`${leadForm.nextFollowUp}T12:00:00`).toISOString() } : {}),
        ...(leadForm.notes.trim() ? { notes: leadForm.notes.trim() } : {}),
      };
      await api('/crm/leads', { method: 'POST', body: JSON.stringify(payload) });
      setLeadForm({ name: '', companyName: '', email: '', phone: '', source: '', estimatedValue: '', nextFollowUp: '', notes: '' });
      setLeadFormOpen(false);
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function updateLead(lead: Lead, stage: LeadStage) {
    try {
      await api(`/crm/leads/${lead._id}`, { method: 'PATCH', body: JSON.stringify({ stage }) });
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function convertLead(lead: Lead) {
    try {
      await api(`/crm/leads/${lead._id}/convert`, { method: 'POST' });
      setNotice(t('leadConverted'));
      await loadData();
      setTab('customers');
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function createOrder(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/crm/orders', { method: 'POST', body: JSON.stringify({ ...orderForm, total: Number(orderForm.total), expectedAt: orderForm.expectedAt ? new Date(`${orderForm.expectedAt}T12:00:00`).toISOString() : undefined }) });
      setOrderForm({ customerId: '', description: '', total: '', expectedAt: '' });
      setOrderFormOpen(false);
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function updateOrder(order: CRMOrder, status: OrderStatus) {
    try {
      await api(`/crm/orders/${order._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  function selectTemplate(template: Template) {
    setSelectedTemplate(template);
    setTemplateForm({ name: template.name, channel: template.channel, subject: template.subject || '', body: template.body });
  }

  async function saveTemplate(event: FormEvent) {
    event.preventDefault();
    const method = selectedTemplate?._id ? 'PATCH' : 'POST';
    const path = selectedTemplate?._id ? `/crm/templates/${selectedTemplate._id}` : '/crm/templates';
    try {
      const saved = await api<Template>(path, { method, body: JSON.stringify(templateForm) });
      setSelectedTemplate(saved);
      setTemplateForm({ name: saved.name, channel: saved.channel, subject: saved.subject || '', body: saved.body });
      setNotice(t('templateSaved'));
      await loadData();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  function messageHref() {
    if (!selectedTemplate || !recipient) return '#';
    const body = templateForm.body
      .replace(/\{\{customer_name\}\}/g, recipient.name)
      .replace(/\{\{company_name\}\}/g, '')
      .replace(/\{\{appointment_date\}\}/g, new Date().toLocaleDateString(i18n.language === 'en' ? 'en-CM' : 'fr-FR'));
    return templateForm.channel === 'email'
      ? `mailto:${recipient.email || ''}?subject=${encodeURIComponent(templateForm.subject || '')}&body=${encodeURIComponent(body)}`
      : `sms:${recipient.phone || ''}?body=${encodeURIComponent(body)}`;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'customers', label: t('crmCustomers') },
    { id: 'leads', label: t('leadsTab') },
    { id: 'orders', label: t('ordersTab') },
    { id: 'messages', label: t('messagesTab') },
    { id: 'billing', label: t('customerBilling') },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{t('crm')}</p><h1 className="text-3xl font-black">{t('customers')}</h1><p className="mt-1 text-slate-500">{t('customersIntro')}</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/billing" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"><FileText size={16} />{t('viewBilling')}<ArrowUpRight size={15} /></Link><button onClick={() => setCustomerFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} />{t('newCustomer')}</button></div>
      </header>

      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-800'}`}>{error || notice}<button className="ml-3 font-bold" onClick={() => { setError(''); setNotice(''); }} aria-label={t('close')}>×</button></div>}

      <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === item.id ? 'border-teal-700 text-teal-800 dark:text-teal-300' : 'border-transparent text-slate-500'}`}>{item.label}{item.id === 'leads' && <span className="ml-2 text-xs text-slate-400">{leads.length}</span>}{item.id === 'orders' && <span className="ml-2 text-xs text-slate-400">{orders.length}</span>}</button>)}</nav>

      {tab === 'customers' && <section className="space-y-4">
        {customerFormOpen && <form onSubmit={createCustomer} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"><input required placeholder={t('customerName')} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} className="field" /><input type="email" placeholder={t('email')} value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} className="field" /><input placeholder={t('phone')} value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} className="field" /><input placeholder={t('city')} value={customerForm.city} onChange={(event) => setCustomerForm({ ...customerForm, city: event.target.value })} className="field" /><select className="field" value={customerForm.type} onChange={(event) => setCustomerForm({ ...customerForm, type: event.target.value })}><option value="company">{t('company')}</option><option value="individual">{t('individual')}</option></select><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">{t('save')}</button></form>}
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchCustomer')} className="field w-full pl-10" /></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800"><tr><th className="px-5 py-4">{t('client')}</th><th className="px-5 py-4">{t('contact')}</th><th className="px-5 py-4">{t('type')}</th><th className="px-5 py-4">{t('invoicesAndPayments')}</th><th className="px-5 py-4 text-right">{t('action')}</th></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer._id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4"><div className="font-bold">{customer.name}</div><div className="text-xs text-slate-500">{customer.city || t('cityUnknown')}</div></td><td className="px-5 py-4 text-slate-500">{customer.email || customer.phone || t('noContact')}</td><td className="px-5 py-4">{customer.type === 'individual' ? t('individual') : t('company')}</td><td className="px-5 py-4"><Link to="/billing" className="font-semibold text-teal-800 hover:underline">{t('viewBilling')}</Link></td><td className="px-5 py-4 text-right"><div className="inline-flex items-center gap-2"><button onClick={() => void openHistory(customer)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-slate-700"><MessageSquare size={14} />{t('customerHistory')}</button><button title={t('delete')} aria-label={`${t('delete')}: ${customer.name}`} onClick={() => void removeCustomer(customer)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div></td></tr>)}{filteredCustomers.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-400"><Users className="mx-auto mb-2" />{t('noCustomers')}</td></tr>}</tbody></table></div>
      </section>}

      {tab === 'leads' && <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t('leadsTab')}</h2><button onClick={() => setLeadFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-3 py-2 text-sm font-bold text-white"><Plus size={16} />{t('newLead')}</button></div>
        {leadFormOpen && <form onSubmit={createLead} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"><input required className="field" placeholder={t('leadName')} value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} /><input className="field" placeholder={t('leadCompany')} value={leadForm.companyName} onChange={(event) => setLeadForm({ ...leadForm, companyName: event.target.value })} /><input type="email" className="field" placeholder={t('email')} value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} /><input className="field" placeholder={t('phone')} value={leadForm.phone} onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })} /><input className="field" placeholder={t('leadSource')} value={leadForm.source} onChange={(event) => setLeadForm({ ...leadForm, source: event.target.value })} /><input type="number" min="0" className="field" placeholder={t('estimatedValue')} value={leadForm.estimatedValue} onChange={(event) => setLeadForm({ ...leadForm, estimatedValue: event.target.value })} /><label className="space-y-1 text-xs font-semibold text-slate-500">{t('followUp')}<input type="date" className="field w-full" value={leadForm.nextFollowUp} onChange={(event) => setLeadForm({ ...leadForm, nextFollowUp: event.target.value })} /></label><textarea className="field sm:col-span-2" placeholder={t('notes')} value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} /><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white sm:col-span-2">{t('addLead')}</button></form>}
        <div className="grid gap-3 xl:grid-cols-2">{leads.map((lead) => <article key={lead._id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{lead.companyName || t('leadsTab')}</p><h3 className="mt-1 text-lg font-bold">{lead.name}</h3><p className="mt-1 text-sm text-slate-500">{lead.email || lead.phone || t('noContact')}</p>{lead.source && <p className="mt-2 text-xs text-slate-500">{t('leadSource')}: {lead.source}</p>}<div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">{lead.estimatedValue !== undefined && <span>{money(lead.estimatedValue, locale)}</span>}{lead.nextFollowUp && <span className="inline-flex items-center gap-1"><CalendarClock size={13} />{t('followUp')}: {localizedDate(lead.nextFollowUp)}</span>}</div></div><div className="flex shrink-0 flex-col gap-2"><label className="text-xs font-semibold text-slate-500">{t('salesStage')}<select className="field mt-1 w-full" value={lead.stage} onChange={(event) => void updateLead(lead, event.target.value as LeadStage)}>{leadStages.map((stage) => <option key={stage} value={stage}>{t(leadStageKey[stage])}</option>)}</select></label>{!lead.customerId && <button onClick={() => void convertLead(lead)} className="rounded-lg border border-teal-200 px-3 py-2 text-xs font-bold text-teal-800 dark:border-teal-900 dark:text-teal-300">{t('convertLead')}</button>}</div></div>{lead.notes && <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{lead.notes}</p>}</article>)}{leads.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center text-sm text-slate-500 xl:col-span-2">{t('noLeads')}</div>}</div>
      </section>}

      {tab === 'orders' && <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t('ordersTab')}</h2><button onClick={() => setOrderFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-3 py-2 text-sm font-bold text-white"><Plus size={16} />{t('newOrder')}</button></div>
        {orderFormOpen && <form onSubmit={createOrder} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"><select required className="field" value={orderForm.customerId} onChange={(event) => setOrderForm({ ...orderForm, customerId: event.target.value })}><option value="">{t('selectCustomer')}</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}</select><input required min="0" type="number" className="field" placeholder={t('amount')} value={orderForm.total} onChange={(event) => setOrderForm({ ...orderForm, total: event.target.value })} /><input required className="field sm:col-span-2" placeholder={t('orderDescription')} value={orderForm.description} onChange={(event) => setOrderForm({ ...orderForm, description: event.target.value })} /><label className="space-y-1 text-xs font-semibold text-slate-500">{t('expectedDelivery')}<input type="date" className="field w-full" value={orderForm.expectedAt} onChange={(event) => setOrderForm({ ...orderForm, expectedAt: event.target.value })} /></label><button className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">{t('createOrder')}</button></form>}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800"><tr><th className="px-5 py-4">{t('orderNumber')}</th><th className="px-5 py-4">{t('client')}</th><th className="px-5 py-4">{t('orderDescription')}</th><th className="px-5 py-4">{t('amount')}</th><th className="px-5 py-4">{t('orderStatus')}</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4 font-bold">{order.number}</td><td className="px-5 py-4">{order.customerName}</td><td className="px-5 py-4">{order.description}{order.expectedAt && <div className="mt-1 text-xs text-slate-500">{t('expectedDelivery')}: {localizedDate(order.expectedAt)}</div>}</td><td className="px-5 py-4 font-semibold">{money(order.total, locale)}</td><td className="px-5 py-4"><select className="field max-w-40" value={order.status} onChange={(event) => void updateOrder(order, event.target.value as OrderStatus)}>{orderStatuses.map((status) => <option key={status} value={status}>{t(orderStatusKey[status])}</option>)}</select></td></tr>)}{orders.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">{t('noOrders')}</td></tr>}</tbody></table></div>
      </section>}

      {tab === 'messages' && <section className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="font-bold">{t('templates')}</h2><button type="button" onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: '', channel: 'email', subject: '', body: '' }); }} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700" title={t('newTemplate')}><Plus size={16} /></button></div>{templates.map((entry) => <button type="button" key={entry._id} onClick={() => { setSelectedTemplate(entry); setTemplateForm({ name: entry.name, channel: entry.channel, subject: entry.subject || '', body: entry.body }); }} className={`w-full border-b border-slate-100 py-3 text-left dark:border-slate-800 ${selectedTemplate?._id === entry._id ? 'text-teal-800 dark:text-teal-300' : ''}`}><span className="flex items-center gap-2 text-xs uppercase text-slate-500">{entry.channel === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}{entry.channel === 'email' ? t('emailChannel') : t('smsChannel')}</span><span className="mt-1 block font-semibold">{entry.name}</span></button>)}</div>
        <form onSubmit={saveTemplate} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="font-bold">{selectedTemplate ? t('edit') : t('newTemplate')}</h2><select className="field" value={templateForm.channel} onChange={(event) => setTemplateForm({ ...templateForm, channel: event.target.value as 'email' | 'sms' })}><option value="email">{t('emailChannel')}</option><option value="sms">{t('smsChannel')}</option></select></div><input required className="field w-full" placeholder={t('templateName')} value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} />{templateForm.channel === 'email' && <input className="field w-full" placeholder={t('subject')} value={templateForm.subject} onChange={(event) => setTemplateForm({ ...templateForm, subject: event.target.value })} />}<textarea required rows={7} className="field w-full resize-y" placeholder={t('messageBody')} value={templateForm.body} onChange={(event) => setTemplateForm({ ...templateForm, body: event.target.value })} /><button className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white">{t('saveTemplate')}</button><div className="grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-[1fr_auto] dark:border-slate-800"><select className="field" aria-label={t('recipient')} value={recipientId} onChange={(event) => setRecipientId(event.target.value)}><option value="">{t('recipient')}</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}</select><a href={messageHref()} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${recipient && selectedTemplate ? 'bg-slate-900 text-white' : 'pointer-events-none bg-slate-200 text-slate-500'}`}><ArrowUpRight size={15} />{templateForm.channel === 'email' ? t('openEmail') : t('openSms')}</a></div></form>
      </section>}

      {tab === 'billing' && <section className="space-y-3"><h2 className="text-lg font-bold">{t('invoicesAndPayments')}</h2><LiveBillingList /></section>}

      {selectedCustomer && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCustomer(null); }}><section role="dialog" aria-modal="true" aria-labelledby="history-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><header className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">{t('customerHistory')}</p><h2 id="history-title" className="mt-1 text-2xl font-black">{selectedCustomer.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedCustomer.email || selectedCustomer.phone}</p></div><button aria-label={t('close')} onClick={() => setSelectedCustomer(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></header><form onSubmit={addActivity} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[160px_1fr_auto] dark:bg-slate-800"><select className="field" value={activityType} onChange={(event) => setActivityType(event.target.value)}>{['note', 'call', 'email', 'sms', 'meeting'].map((type) => <option key={type} value={type}>{t(type === 'note' ? 'notes' : type === 'email' ? 'emailChannel' : type === 'sms' ? 'smsChannel' : type)}</option>)}</select><input required className="field" placeholder={t('activityContent')} value={activityContent} onChange={(event) => setActivityContent(event.target.value)} /><button className="rounded-lg bg-teal-800 px-3 py-2 text-sm font-bold text-white">{t('saveActivity')}</button></form><div className="mt-5 space-y-3">{activities.map((activity) => <article key={activity._id} className="border-l-2 border-teal-500 pl-4"><div className="flex justify-between gap-3"><span className="text-xs font-bold uppercase text-teal-800 dark:text-teal-300">{t(activity.type === 'email' ? 'emailChannel' : activity.type === 'sms' ? 'smsChannel' : activity.type)}</span><time className="text-xs text-slate-500">{localizedDate(activity.createdAt)}</time></div><p className="mt-1 whitespace-pre-wrap text-sm">{activity.content}</p></article>)}{activities.length === 0 && <p className="py-8 text-center text-sm text-slate-500">{t('noActivity')}</p>}</div><Link to="/billing" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-800 dark:text-teal-300">{t('viewBilling')}<ArrowUpRight size={15} /></Link></section></div>}
    </div>
  );
}