import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

type Session = { accessToken: string; refreshToken: string; user: { id: string; companyId: string; firstName: string; lastName: string; email: string; role: string; permissions: string[] } };

export default function AuthPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const setSession = useAuthStore((state) => state.setSession);
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ companyName: '', firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api<Session>(register ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(register ? form : { email: form.email, password: form.password }),
      });
      setSession(data);
      navigate('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (isEnglish ? 'Unable to log in' : 'Impossible de se connecter'));
    } finally {
      setLoading(false);
    }
  }

  const isEnglish = i18n.language?.startsWith('en');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl font-black">Kôdo<span className="text-emerald-500">.</span></div>
            <p className="mt-2 text-sm text-slate-500">{isEnglish ? 'The digital cockpit for your business.' : 'Le cockpit digital de votre entreprise.'}</p>
          </div>
          <button
            type="button"
            onClick={() => i18n.changeLanguage(isEnglish ? 'fr' : 'en')}
            title={isEnglish ? 'Passer en français' : 'Switch to English'}
            aria-label={isEnglish ? 'Passer en français' : 'Switch to English'}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700"
          >
            <Languages size={15} />
            {isEnglish ? 'FR' : 'EN'}
          </button>
        </div>
        <h1 className="text-2xl font-black">{register ? (isEnglish ? 'Create your space' : 'Créer votre espace') : (isEnglish ? 'Welcome back' : 'Bon retour')}</h1>
        <p className="mt-1 text-sm text-slate-500">{register ? (isEnglish ? 'Set up your business in a few seconds.' : 'Configurez votre entreprise en quelques secondes.') : (isEnglish ? 'Log in to access your data.' : 'Connectez-vous pour accéder à vos données.')}</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {register && <>
            <input required placeholder={isEnglish ? 'Company name' : "Nom de l'entreprise"} value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} className="field w-full" />
            <div className="grid grid-cols-2 gap-3"><input required placeholder={isEnglish ? 'First name' : 'Prénom'} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="field" /><input required placeholder={isEnglish ? 'Last name' : 'Nom'} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="field" /></div>
          </>}
          <input required type="email" placeholder={isEnglish ? 'Business email' : 'Email professionnel'} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field w-full" />
          <input required minLength={8} type="password" placeholder={isEnglish ? 'Password (8 characters minimum)' : 'Mot de passe (8 caractères minimum)'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field w-full" />
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? (isEnglish ? 'Loading...' : 'Chargement...') : register ? (isEnglish ? 'Create my space' : 'Créer mon espace') : (isEnglish ? 'Log in' : 'Se connecter')}</button>
        </form>
        <button onClick={() => { setRegister(!register); setError(''); }} className="mt-5 w-full text-sm font-semibold text-emerald-700 hover:underline">{register ? (isEnglish ? 'I already have an account' : 'J’ai déjà un compte') : (isEnglish ? 'Create a business account' : 'Créer un compte entreprise')}</button>
      </div>
    </div>
  );
}
