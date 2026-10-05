import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Check, ClipboardList, FileText, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

type OperationKind = 'task' | 'project' | 'note' | 'event';
type OperationStatus = 'todo' | 'in_progress' | 'done';
type OperationPriority = 'low' | 'normal' | 'high';
type OperationEventType = 'appointment' | 'delivery' | 'meeting';
type TeamMember = { _id: string; firstName: string; lastName: string; email: string };
type Operation = {
  _id: string;
  kind: OperationKind;
  title: string;
  description: string;
  status: OperationStatus;
  priority: OperationPriority;
  eventType?: OperationEventType;
  dueAt?: string;
  scheduledAt?: string;
  createdAt: string;
  createdBy: string;
  assignedTo?: string | TeamMember;
};

type Draft = {
  kind: OperationKind;
  title: string;
  description: string;
  priority: OperationPriority;
  eventType: OperationEventType;
  dueAt: string;
  scheduledAt: string;
  assignedTo: string;
};

const emptyDraft: Draft = {
  kind: 'task',
  title: '',
  description: '',
  priority: 'normal',
  eventType: 'appointment',
  dueAt: '',
  scheduledAt: '',
  assignedTo: '',
};

export default function OperationsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<Operation[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [activeKind, setActiveKind] = useState<'all' | OperationKind>('all');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    try {
      setItems(await api<Operation[]>('/operations'));
      if (['owner', 'admin', 'manager', 'hr'].includes(user?.role || '')) {
        setTeam(await api<TeamMember[]>('/hr/team'));
      } else {
        setTeam([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const visibleItems = items.filter((item) => activeKind === 'all' || item.kind === activeKind);
  const counts = items.reduce<Record<OperationKind, number>>((result, item) => {
    result[item.kind] += 1;
    return result;
  }, { task: 0, project: 0, note: 0, event: 0 });
  const tabs: { id: 'all' | OperationKind; label: string; count: number }[] = [
    { id: 'all', label: t('allOperations'), count: items.length },
    { id: 'task', label: t('tasks'), count: counts.task },
    { id: 'project', label: t('projectList'), count: counts.project },
    { id: 'note', label: t('internalNotes'), count: counts.note },
    { id: 'event', label: t('schedule'), count: counts.event },
  ];

  async function createOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      kind: draft.kind,
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      ...(draft.assignedTo ? { assignedTo: draft.assignedTo } : {}),
      ...(draft.kind === 'event' ? { eventType: draft.eventType } : {}),
      ...(draft.dueAt ? { dueAt: new Date(`${draft.dueAt}T23:59:00`).toISOString() } : {}),
      ...(draft.scheduledAt ? { scheduledAt: new Date(draft.scheduledAt).toISOString() } : {}),
    };
    try {
      await api('/operations', { method: 'POST', body: JSON.stringify(payload) });
      setDraft(emptyDraft);
      await loadItems();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item: Operation, status: OperationStatus) {
    try {
      const updated = await api<Operation>(`/operations/${item._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setItems((current) => current.map((entry) => entry._id === item._id ? updated : entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    }
  }

  async function remove(item: Operation) {
    if (!window.confirm(t('deleteEntryConfirm'))) return;
    try {
      await api(`/operations/${item._id}`, { method: 'DELETE' });
      setItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('error'));
    }
  }

  const kindLabel = (kind: OperationKind) => t(kind);
  const statusLabel = (status: OperationStatus) => t(status === 'todo' ? 'markTodo' : status === 'done' ? 'markDone' : 'markInProgress');
  const dateLabel = (value?: string, includeTime = false) => value
    ? new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-CM' : 'fr-FR', { dateStyle: 'medium', ...(includeTime ? { timeStyle: 'short' as const } : {}) }).format(new Date(value))
    : '';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('operations')}</p>
          <h1 className="mt-1 text-3xl font-black">{t('operationsTitle')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{t('operationsIntro')}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          <span className="font-semibold">{user ? `${user.firstName} ${user.lastName}` : t('teamMember')}</span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { kind: 'task' as const, icon: Check, label: t('tasks') },
          { kind: 'project' as const, icon: FolderKanban, label: t('projectList') },
          { kind: 'note' as const, icon: FileText, label: t('internalNotes') },
          { kind: 'event' as const, icon: CalendarDays, label: t('schedule') },
        ].map(({ kind, icon: Icon, label }) => (
          <button key={kind} onClick={() => { setDraft({ ...emptyDraft, kind }); document.getElementById('operation-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="flex items-center justify-between border-b border-slate-200 bg-white p-4 text-left transition hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900">
            <span><span className="block text-sm text-slate-500">{label}</span><strong className="mt-1 block text-2xl">{counts[kind]}</strong></span>
            <Icon size={19} className="text-teal-700" />
          </button>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <form id="operation-form" onSubmit={createOperation} className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-teal-700" />
            <h2 className="text-lg font-bold">{t('newEntry')}</h2>
          </div>
          <label className="block space-y-1.5 text-sm font-semibold">{t('type')}
            <select className="field w-full" value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as OperationKind })}>
              {(['task', 'project', 'note', 'event'] as OperationKind[]).map((kind) => <option key={kind} value={kind}>{kindLabel(kind)}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-semibold">{t('title')}
            <input required maxLength={120} className="field w-full" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="block space-y-1.5 text-sm font-semibold">{t('details')}
            <textarea rows={4} maxLength={2000} className="field w-full resize-y" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          {(draft.kind === 'task' || draft.kind === 'project') && <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-semibold">{t('priority')}
              <select className="field w-full" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as OperationPriority })}>
                {(['low', 'normal', 'high'] as OperationPriority[]).map((priority) => <option key={priority} value={priority}>{t(priority)}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">{t('dueDate')}
              <input type="date" className="field w-full" value={draft.dueAt} onChange={(event) => setDraft({ ...draft, dueAt: event.target.value })} />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold sm:col-span-2">{t('assignee')}
              <select className="field w-full" value={draft.assignedTo} onChange={(event) => setDraft({ ...draft, assignedTo: event.target.value })}>
                <option value="">{t('unassigned')}</option>
                {team.map((member) => <option key={member._id} value={member._id}>{member.firstName} {member.lastName}</option>)}
              </select>
            </label>
          </div>}
          {draft.kind === 'event' && <>
            <label className="block space-y-1.5 text-sm font-semibold">{t('eventType')}
              <select required className="field w-full" value={draft.eventType} onChange={(event) => setDraft({ ...draft, eventType: event.target.value as OperationEventType })}>
                {(['appointment', 'delivery', 'meeting'] as OperationEventType[]).map((eventType) => <option key={eventType} value={eventType}>{t(eventType)}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">{t('scheduledAt')}
              <input required type="datetime-local" className="field w-full" value={draft.scheduledAt} onChange={(event) => setDraft({ ...draft, scheduledAt: event.target.value })} />
            </label>
          </>}
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"><Plus size={16} />{saving ? t('loading') : t('createEntry')}</button>
        </form>

        <div className="min-w-0 space-y-4">
          <nav aria-label={t('operations')} className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => <button key={tab.id} onClick={() => setActiveKind(tab.id)} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${activeKind === tab.id ? 'border-teal-700 text-teal-800 dark:text-teal-300' : 'border-transparent text-slate-500'}`}>
              {tab.label}<span className="ml-2 text-xs text-slate-400">{tab.count}</span>
            </button>)}
          </nav>
          {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-3">
            {visibleItems.map((item) => <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300"><span>{kindLabel(item.kind)}</span>{item.eventType && <span>{t(item.eventType)}</span>}{item.priority && item.kind !== 'note' && item.kind !== 'event' && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t(item.priority)}</span>}</div>
                  <h3 className="mt-1 break-words font-bold">{item.title}</h3>
                  {item.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {item.assignedTo && <span>{t('assignedTo')}: {typeof item.assignedTo === 'string' ? team.find((member) => member._id === item.assignedTo)?.firstName || t('teamMember') : `${item.assignedTo.firstName} ${item.assignedTo.lastName}`}</span>}
                    {item.dueAt && <span>{t('dueDate')}: {dateLabel(item.dueAt)}</span>}
                    {item.scheduledAt && <span>{t('scheduledAt')}: {dateLabel(item.scheduledAt, true)}</span>}
                    <span>{t('createdBy')} {item.createdBy === user?.id ? t('you') : t('teamMember')} · {dateLabel(item.createdAt, true)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {(item.kind === 'task' || item.kind === 'project') && <select aria-label={`${t('status')}: ${item.title}`} className="field max-w-36 px-2 py-1 text-xs" value={item.status} onChange={(event) => void updateStatus(item, event.target.value as OperationStatus)}>
                    <option value="todo">{t('markTodo')}</option>
                    <option value="in_progress">{t('markInProgress')}</option>
                    <option value="done">{t('markDone')}</option>
                  </select>}
                  <button title={t('delete')} aria-label={`${t('delete')}: ${item.title}`} onClick={() => void remove(item)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
            </article>)}
            {visibleItems.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 px-4 py-14 text-center text-sm text-slate-500 dark:border-slate-700"><ClipboardList className="mx-auto mb-2" size={24} />{t('noEntries')}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
