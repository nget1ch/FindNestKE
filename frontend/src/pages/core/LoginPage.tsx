import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useLoginMutation } from '../../store/apiSlice';
import { setCredentials } from '../../store/authSlice';
import { normalizeStoredRole } from '../../lib/roles';
import PublicHeader from '../../components/nestfind/PublicHeader';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const sessionExpired = searchParams.get('message') === 'session_expired';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const loadingToast = toast.loading('Signing in...');
    try {
      const result: any = await login({ email: email.trim(), password }).unwrap();
      toast.success('Successfully signed in!', { id: loadingToast });
      
      if (result.accessToken && result.user) {
        localStorage.setItem('refreshToken', result.refreshToken || '');
        dispatch(setCredentials({ token: result.accessToken, user: result.user }));
        const role = normalizeStoredRole(result.user.role);
        navigate(role === 'admin' ? '/admin' : role === 'landlord' ? '/landlord' : '/tenant', { replace: true });
      }
    } catch (err: any) {
      const errorMsg = err?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden font-body">
      <PublicHeader variant="solid" />
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 mt-[60px]">
        <img
          alt="Luxury Architecture"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-2xl md:p-10">
          
          {/* Brand Header */}
          <div className="mb-8 text-center">
            <h1 className="font-headline text-2xl font-black tracking-tight text-on-surface mb-1">Welcome Back</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Sign in to your NestFind account.</p>
          </div>

          {/* Contextual Messages */}
          {sessionExpired && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <span className="material-symbols-outlined text-lg text-amber-500">lock_clock</span>
              <p className="text-xs font-semibold text-amber-700">Your session expired. Please sign in again.</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-primary outline-none transition-all placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-end justify-between">
                <label className="text-xs font-bold text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-primary outline-none transition-all placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-container disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
