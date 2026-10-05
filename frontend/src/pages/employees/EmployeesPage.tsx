import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { ArrowDownToLine, BriefcaseBusiness, CalendarDays, Check, Clock3, Plus, UserRound, X } from 'lucide-react';

type Role = 'admin' | 'manager' | 'staff' | 'accountant' | 'seller' | 'hr' | 'stock_manager' | 'project_manager' | 'employee';
type Employee = { _id: string; firstName: string; lastName: string; email: string; phone?: string; role: Role; isActive: boolean; hourlyRate?: number };
type Attendance = { _id: string; employeeId: string | Pick<Employee, '_id' | 'firstName' | 'lastName' | 'email' | 'hourlyRate'>; workDate: string; checkedInAt: string; checkedOutAt?: string; workedMinutes: number };
type Leave = { _id: string; employeeId: string | Pick<Employee, '_id' | 'firstName' | 'lastName' | 'email'>; kind: string; startDate: string; endDate: string; reason: string; status: 'pending' | 'approved' | 'rejected' };
type PayrollRow = { employeeId: string; firstName: string; lastName: string; email: string; hourlyRate: number; days: number; workedMinutes: number; hours: number; grossPay: number };

const roles: Role[] = ['admin', 'manager', 'staff', 'accountant', 'seller', 'hr', 'stock_manager', 'project_manager', 'employee'];
const leaveKinds = ['annual', 'sick', 'personal', 'unpaid'] as const;
const currentMonth = new Date().toISOString().slice(0, 7);
const managerRoles = ['owner', 'admin', 'manager', 'hr'];
const money = (value: number, locale: string) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

export default function EmployeesPage() {
  const { t, i18n } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = managerRoles.includes(currentUser?.role || '');
  const [tab, setTab] = useState<'team' | 'attendance' | 'leaves' | 'payroll'>(canManage ? 'team' : 'attendance');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [month, setMonth] = useState(currentMonth);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'staff' as Role, hourlyRate: '0' });
  const [leaveForm, setLeaveForm] = useState({ kind: 'annual', startDate: '', endDate: '', reason: '' });
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [saving, setSaving] = useState(false);
  const locale = i18n.language === 'en' ? 'en-CM' : 'fr-FR';

  async function loadTeam() {
    if (!canManage) return;
    try { setEmployees(await api<Employee[]>('/hr/team')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function loadAttendance() {
    try {
      const path = canManage ? `/hr/attendance/team?month=${month}` : `/hr/attendance/mine?month=${month}`;
      setAttendance(await api<Attendance[]>(path));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function loadLeaves() {
    try {
      const path = canManage ? '/hr/leaves/team' : '/hr/leaves/mine';
      setLeaves(await api<Leave[]>(path));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  useEffect(() => { void loadTeam(); void loadAttendance(); void loadLeaves(); }, [canManage, month]);

  const openShift = attendance.find((entry) => !entry.checkedOutAt && (typeof entry.employeeId === 'string' ? entry.employeeId === currentUser?.id : entry.employeeId?._id === currentUser?.id));
  const dateLabel = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value));

  async function submitEmployee(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/employees', { method: 'POST', body: JSON.stringify({ ...form, hourlyRate: Number(form.hourlyRate) }) });
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'staff', hourlyRate: '0' });
      setOpen(false);
      await loadTeam();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function updateEmployee(employee: Employee, data: Partial<Pick<Employee, 'role' | 'hourlyRate'>>) {
    try {
      await api(`/employees/${employee._id}`, { method: 'PATCH', body: JSON.stringify(data) });
      await loadTeam();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function deactivate(employee: Employee) {
    if (!window.confirm(t('deactivateEmployeeConfirm'))) return;
    try {
      await api(`/employees/${employee._id}`, { method: 'DELETE' });
      await loadTeam();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function clock(kind: 'clock-in' | 'clock-out') {
    try {
      await api(`/hr/attendance/${kind}`, { method: 'POST', body: JSON.stringify(kind === 'clock-out' ? { breakMinutes: Number(breakMinutes) } : {}) });
      setNotice(t('attendanceSaved'));
      await loadAttendance();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function requestLeave(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/hr/leaves', { method: 'POST', body: JSON.stringify({ ...leaveForm, startDate: new Date(`${leaveForm.startDate}T12:00:00`).toISOString(), endDate: new Date(`${leaveForm.endDate}T12:00:00`).toISOString() }) });
      setLeaveForm({ kind: 'annual', startDate: '', endDate: '', reason: '' });
      setNotice(t('leaveSubmitted'));
      await loadLeaves();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function reviewLeave(leave: Leave, status: 'approved' | 'rejected') {
    try {
      await api(`/hr/leaves/${leave._id}/review`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setNotice(t('leaveReviewed'));
      await loadLeaves();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  async function loadPayroll() {
    try {
      const result = await api<{ month: string; rows: PayrollRow[] }>(`/hr/payroll?month=${month}`);
      setPayroll(result.rows);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('error')); }
  }

  function exportPayroll() {
    const rows = [
      [t('payrollEmployee'), t('email'), t('payrollDays'), t('payrollHours'), t('hourlyRate'), t('grossPay')],
      ...payroll.map((row) => [`${row.firstName} ${row.lastName}`, row.email, row.days, row.hours, row.hourlyRate, row.grossPay]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `payroll-${month}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const tabs = [
    ...(canManage ? [{ id: 'team' as const, label: t('teamTab') }] : []),
    { id: 'attendance' as const, label: t('attendanceTab') },
    { id: 'leaves' as const, label: t('leavesTab') },
    ...(canManage ? [{ id: 'payroll' as const, label: t('payrollTab') }] : []),
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{t('team')}</p><h1 className="text-3xl font-black">{t('employees')}</h1><p className="mt-1 text-slate-500">{t('employeesIntro')}</p></div>
        {canManage && <button onClick={() => setOpen((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} />{t('inviteEmployee')}</button>}
      </header>
      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-teal-50 text-teal-800'}`}>{error || notice}<button className="ml-3 font-bold" onClick={() => { setError(''); setNotice(''); }} aria-label={t('close')}>×</button></div>}

      {open && canManage && <form onSubmit={submitEmployee} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"><input required placeholder={t('firstName')} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="field" /><input required placeholder={t('lastName')} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="field" /><input required type="email" placeholder={t('professionalEmail')} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field" /><input required minLength={8} type="password" placeholder={t('temporaryPassword')} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field" /><select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{t(role)}</option>)}</select><input type="number" min="0" className="field" placeholder={t('employeePayRate')} value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} /><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white sm:col-span-2">{t('createAccount')}</button></form>}

      <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === item.id ? 'border-teal-700 text-teal-800 dark:text-teal-300' : 'border-transparent text-slate-500'}`}>{item.label}</button>)}</nav>

      {tab === 'team' && canManage && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{employees.map((employee) => <article key={employee._id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">{employee.firstName[0]}{employee.lastName[0]}</div><button title={t('deactivate')} onClick={() => void deactivate(employee)} className="text-slate-400 hover:text-red-600"><UserRound size={17} /></button></div><h2 className="mt-4 font-bold">{employee.firstName} {employee.lastName}</h2><p className="text-sm text-slate-500">{employee.email}</p><label className="mt-4 block space-y-1 text-xs font-semibold text-slate-500">{t('role')}<select className="field w-full" value={employee.role} onChange={(event) => void updateEmployee(employee, { role: event.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{t(role)}</option>)}</select></label><label className="mt-3 block space-y-1 text-xs font-semibold text-slate-500">{t('employeePayRate')}<input type="number" min="0" defaultValue={employee.hourlyRate || 0} onBlur={(event) => { const hourlyRate = Number(event.target.value); if (hourlyRate !== (employee.hourlyRate || 0)) void updateEmployee(employee, { hourlyRate }); }} className="field w-full" /></label><p className={`mt-3 text-xs font-semibold ${employee.isActive ? 'text-teal-700' : 'text-slate-400'}`}>{employee.isActive ? t('active') : t('inactive')}</p></article>)}{employees.length === 0 && <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500"><BriefcaseBusiness className="mx-auto mb-2" />{t('noEmployees')}</div>}</div>}

      {tab === 'attendance' && <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">{t('timeClock')}</h2><label className="mt-2 block text-xs font-semibold text-slate-500">{t('attendanceMonth')}<input type="month" className="field mt-1 block" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div><div className="flex flex-wrap items-end gap-2">{!openShift && <button onClick={() => void clock('clock-in')} className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-bold text-white"><Clock3 size={16} />{t('clockIn')}</button>}{openShift && <><label className="text-xs font-semibold text-slate-500">{t('breakMinutes')}<input type="number" min="0" max="720" className="field mt-1 block w-28" value={breakMinutes} onChange={(event) => setBreakMinutes(event.target.value)} /></label><button onClick={() => void clock('clock-out')} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Check size={16} />{t('clockOut')}</button></>}</div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800"><tr>{canManage && <th className="px-5 py-4">{t('employee')}</th>}<th className="px-5 py-4">{t('date')}</th><th className="px-5 py-4">{t('checkedInAt')}</th><th className="px-5 py-4">{t('checkedOutAt')}</th><th className="px-5 py-4">{t('workedHours')}</th></tr></thead><tbody>{attendance.map((entry) => { const employee = typeof entry.employeeId === 'string' ? employees.find((item) => item._id === entry.employeeId) : entry.employeeId; return <tr key={entry._id} className="border-b border-slate-100 dark:border-slate-800">{canManage && <td className="px-5 py-4">{employee ? `${employee.firstName} ${employee.lastName}` : '—'}</td>}<td className="px-5 py-4">{new Date(entry.workDate).toLocaleDateString(locale)}</td><td className="px-5 py-4">{new Date(entry.checkedInAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</td><td className="px-5 py-4">{entry.checkedOutAt ? new Date(entry.checkedOutAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td className="px-5 py-4">{(entry.workedMinutes / 60).toFixed(2)} {t('hoursUnit')}</td></tr>; })}{attendance.length === 0 && <tr><td colSpan={canManage ? 5 : 4} className="px-5 py-12 text-center text-slate-500">{t('noAttendance')}</td></tr>}</tbody></table></div>
      </section>}

      {tab === 'leaves' && <section className="space-y-4">
        <form onSubmit={requestLeave} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-5 dark:border-slate-800 dark:bg-slate-900"><select className="field" value={leaveForm.kind} onChange={(event) => setLeaveForm({ ...leaveForm, kind: event.target.value })}>{leaveKinds.map((kind) => <option key={kind} value={kind}>{t(`${kind}Leave`)}</option>)}</select><label className="text-xs font-semibold text-slate-500">{t('startDate')}<input required type="date" className="field mt-1 w-full" value={leaveForm.startDate} onChange={(event) => setLeaveForm({ ...leaveForm, startDate: event.target.value })} /></label><label className="text-xs font-semibold text-slate-500">{t('endDate')}<input required type="date" className="field mt-1 w-full" value={leaveForm.endDate} onChange={(event) => setLeaveForm({ ...leaveForm, endDate: event.target.value })} /></label><input required className="field" placeholder={t('leaveReason')} value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} /><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-3 py-2 text-sm font-bold text-white"><Plus size={15} />{t('applyLeave')}</button></form>
        <div className="space-y-3">{leaves.map((leave) => { const employee = typeof leave.employeeId === 'string' ? employees.find((item) => item._id === leave.employeeId) : leave.employeeId; return <article key={leave._id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"><div><p className="font-bold">{employee ? `${employee.firstName} ${employee.lastName}` : t(`${leave.kind}Leave`)}</p><p className="mt-1 text-sm text-slate-500">{new Date(leave.startDate).toLocaleDateString(locale)} – {new Date(leave.endDate).toLocaleDateString(locale)} · {leave.reason}</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-slate-800">{t(`${leave.status}Leave`)}</span></div>{canManage && leave.status === 'pending' && <div className="flex gap-2"><button onClick={() => void reviewLeave(leave, 'approved')} className="rounded-lg bg-teal-800 px-3 py-2 text-xs font-bold text-white">{t('approveLeave')}</button><button onClick={() => void reviewLeave(leave, 'rejected')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700">{t('rejectLeave')}</button></div>}</article>; })}{leaves.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-500">{t('noLeaves')}</p>}</div>
      </section>}

      {tab === 'payroll' && canManage && <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><label className="text-xs font-semibold text-slate-500">{t('payrollMonth')}<input type="month" className="field mt-1 block" value={month} onChange={(event) => setMonth(event.target.value)} /></label><div className="flex gap-2"><button onClick={() => void loadPayroll()} className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white">{t('payrollTab')}</button><button onClick={exportPayroll} disabled={!payroll.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50 dark:border-slate-700"><ArrowDownToLine size={15} />{t('exportPayroll')}</button></div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800"><tr><th className="px-5 py-4">{t('payrollEmployee')}</th><th className="px-5 py-4">{t('payrollDays')}</th><th className="px-5 py-4">{t('payrollHours')}</th><th className="px-5 py-4">{t('hourlyRate')}</th><th className="px-5 py-4">{t('grossPay')}</th></tr></thead><tbody>{payroll.map((row) => <tr key={row.employeeId} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-4"><div className="font-bold">{row.firstName} {row.lastName}</div><div className="text-xs text-slate-500">{row.email}</div></td><td className="px-5 py-4">{row.days}</td><td className="px-5 py-4">{row.hours} {t('hoursUnit')}</td><td className="px-5 py-4">{money(row.hourlyRate, i18n.language === 'en' ? 'en-CM' : 'fr-CM')}</td><td className="px-5 py-4 font-bold">{money(row.grossPay, i18n.language === 'en' ? 'en-CM' : 'fr-CM')}</td></tr>)}{payroll.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">{t('noPayrollRows')}</td></tr>}</tbody></table></div>
      </section>}
    </div>
  );
}