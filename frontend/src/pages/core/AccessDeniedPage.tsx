import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../../hooks/useRequireRole';

/**
 * AccessDenied - Displayed when user tries to access a route they're not authorized for
 */
export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const userRole = useUserRole();

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden font-body">
      <div className="fixed inset-0 z-0">
        <img
          alt="Access Denied Background"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1635097869326-e2b2f149d4d0?auto=format&fit=crop&q=80"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-6">
              <span className="material-symbols-outlined text-5xl text-red-600">lock</span>
            </div>
          </div>

          {/* Content */}
          <h1 className="font-headline text-3xl font-black tracking-tight text-white mb-3">
            Access Denied
          </h1>
          <p className="text-lg text-slate-200 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-300 mb-8">
            Your role: <span className="font-bold text-primary">{userRole || 'Unknown'}</span>
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-container"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full rounded-2xl border border-white/30 bg-white/10 py-4 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Go to Home
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/10 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
