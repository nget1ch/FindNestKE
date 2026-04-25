import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';
import { IMAGES } from '../../lib/nestfind';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'tenant',
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result: any = await register(form);
    if (result.data?.user) navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader variant="solid" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 md:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto w-full max-w-md">
            <p className="font-label text-xs font-bold uppercase tracking-wider text-primary">Get started</p>
            <h1 className="font-headline mt-1 text-3xl font-bold text-on-surface">Create your NestFind account</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Choose whether you are renting (tenant) or listing (landlord).</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="font-label text-xs font-bold" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="2547..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold" htmlFor="role">I am a</label>
                <select
                  id="role"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>
              {error ? (
                <p className="rounded-xl border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
                  Registration could not be completed. Check your details.
                </p>
              ) : null}
              <button
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95 disabled:opacity-60"
                type="submit"
              >
                <UserPlus className="h-4 w-4" />
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
              <p className="text-center text-sm text-on-surface-variant">
                Already registered?{' '}
                <Link className="font-semibold text-primary hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
        <div className="relative hidden min-h-[420px] flex-1 lg:block">
          <img src={IMAGES.card} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/95 via-primary/50 to-primary/30" />
          <div className="absolute bottom-0 right-0 max-w-sm p-10 text-right text-white">
            <p className="font-headline text-2xl font-bold leading-snug">List once. Get discovered.</p>
            <p className="mt-2 text-sm text-white/88">A calm dashboard to manage your homes and who wants to book them.</p>
          </div>
        </div>
      </div>
      <MarketFooter />
    </div>
  );
}
