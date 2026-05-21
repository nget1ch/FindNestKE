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
      
      // Verify response structure
      if (!result.accessToken || !result.user) {
        throw new Error('Invalid login response from server');
      }

      // Save refresh token if provided
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      // Store credentials in Redux state (also saved to localStorage by authSlice)
      dispatch(setCredentials({ token: result.accessToken, user: result.user }));

      // Get normalized role from response
      const userRole = normalizeStoredRole(result.user.role);

      if (!userRole) {
        console.error('⚠️ User has no valid role:', result.user.role);
        toast.error('Invalid user role. Please contact support.');
        return;
      }

      toast.success('Successfully signed in!', { id: loadingToast });

      // Redirect based on role
      const redirectPath =
        userRole === 'admin'
          ? '/admin'
          : userRole === 'landlord'
            ? '/landlord'
            : '/tenant'; // Default to tenant for 'tenant' or 'seeker'

      console.log('🔐 Login successful - User role:', userRole, '→ Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const errorMsg = err?.data?.error || 'Login failed. Please check your credentials.';
      console.error('❌ Login error:', err);
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
