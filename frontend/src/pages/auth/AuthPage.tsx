import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

type Session = { accessToken: string; refreshToken: string; user: { id: string; companyId: string; firstName: string; lastName: string; email: string; role: string; permissions: string[] } };

export default function AuthPage() {
  const navigate = useNavigate();
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
      setError(cause instanceof Error ? cause.message : 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <div className="text-3xl font-black">Kôdo<span className="text-emerald-500">.</span></div>
          <p className="mt-2 text-sm text-slate-500">Le cockpit digital de votre entreprise.</p>
        </div>
        <h1 className="text-2xl font-black">{register ? 'Créer votre espace' : 'Bon retour'}</h1>
        <p className="mt-1 text-sm text-slate-500">{register ? 'Configurez votre entreprise en quelques secondes.' : 'Connectez-vous pour accéder à vos données.'}</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {register && <>
            <input required placeholder="Nom de l'entreprise" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} className="field w-full" />
            <div className="grid grid-cols-2 gap-3"><input required placeholder="Prénom" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="field" /><input required placeholder="Nom" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="field" /></div>
          </>}
          <input required type="email" placeholder="Email professionnel" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field w-full" />
          <input required minLength={8} type="password" placeholder="Mot de passe (8 caractères minimum)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field w-full" />
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Chargement...' : register ? 'Créer mon espace' : 'Se connecter'}</button>
        </form>
        <button onClick={() => { setRegister(!register); setError(''); }} className="mt-5 w-full text-sm font-semibold text-emerald-700 hover:underline">{register ? 'J’ai déjà un compte' : 'Créer un compte entreprise'}</button>
      </div>
    </div>
  );
}
