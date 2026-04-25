import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../store/apiSlice';
import { setCredentials } from '../../store/authSlice';
import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';
import { IMAGES } from '../../lib/nestfind';
import { Lock } from 'lucide-react';
import { normalizeStoredRole } from '../../lib/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result: any = await login({ email, password });
    if (result.data?.accessToken && result.data?.user) {
      localStorage.setItem('refreshToken', result.data.refreshToken || '');
      dispatch(setCredentials({ token: result.data.accessToken, user: result.data.user }));
      const role = normalizeStoredRole(result.data.user.role);
      navigate(role === 'admin' ? '/admin' : role === 'landlord' ? '/landlord' : '/tenant');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader variant="solid" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-0 px-0 lg:flex-row lg:gap-0">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 md:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto w-full max-w-md">
            <p className="font-label text-xs font-bold uppercase tracking-wider text-primary">Welcome back</p>
            <h1 className="font-headline mt-1 text-3xl font-bold text-on-surface">Sign in to NestFind</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Use your work email and password. New here? Create an account in minutes.</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="font-label text-xs font-bold text-on-surface" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold text-on-surface" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error ? (
                <p className="rounded-xl border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
                  Sign-in failed. Check your email and password.
                </p>
              ) : null}
              <button
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95 disabled:opacity-60"
                type="submit"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center text-sm text-on-surface-variant">
                No account?{' '}
                <Link className="font-semibold text-primary hover:underline" to="/register">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
        <div className="relative hidden min-h-[420px] flex-1 lg:block">
          <img src={IMAGES.auth} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/40" />
          <div className="absolute bottom-0 left-0 p-10 text-white">
            <p className="font-headline text-2xl font-bold leading-snug">Secure access for tenants & landlords</p>
            <p className="mt-2 max-w-sm text-sm text-white/85">Role-based routing keeps your dashboard relevant to your journey.</p>
          </div>
        </div>
      </div>
      <MarketFooter />
    </div>
  );
}
