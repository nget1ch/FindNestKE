import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Home, LogOut, Menu, X, LayoutGrid } from 'lucide-react';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store';
import MarketFooter from '../../components/nestfind/Footer';
import { normalizeStoredRole } from '../../lib/roles';

export function PageShell({
  title,
  subtitle,
  eyebrow,
  children,
  hideHeader = false,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
      {!hideHeader ? (
        <header className="mb-8 rounded-2xl border border-surface-container-highest bg-surface-container-lowest/90 p-6 shadow-[0_8px_30px_rgba(0,52,97,0.08)]">
          {eyebrow ? (
            <p className="font-label mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-on-surface-variant">{subtitle}</p> : null}
        </header>
      ) : null}
      <section className="space-y-6">{children}</section>
    </main>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-background">
      {children}
      <MarketFooter />
    </div>
  );
}

export function TopNav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((state: RootState) => state.auth) as { user: any; isAuth: boolean };
  const role = normalizeStoredRole(user?.role);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const linkClass = 'rounded-lg px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container';

  return (
    <header className="sticky top-0 z-20 border-b border-surface-container-highest bg-surface/95 font-body shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-headline flex items-center gap-2 text-lg font-bold text-primary" onClick={close}>
          <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-on-primary">
            <Home className="h-5 w-5" aria-hidden />
          </span>
          NestFind Kenya
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <Link className={linkClass} to="/listings">
            Listings
          </Link>
          {isAuth && role === 'tenant' ? (
            <>
              <Link className={linkClass} to="/tenant">
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid className="h-4 w-4" /> Dashboard
                </span>
              </Link>
              <Link className={linkClass} to="/tenant/chatbot">
                Chatbot
              </Link>
            </>
          ) : null}
          {isAuth && role === 'landlord' ? (
            <Link className={linkClass} to="/landlord">
              Dashboard
            </Link>
          ) : null}
          {isAuth && role === 'admin' ? (
            <Link className={linkClass} to="/admin">
              Admin
            </Link>
          ) : null}

          {!isAuth ? (
            <>
              <Link className={linkClass} to="/login">
                Sign in
              </Link>
              <Link
                to="/register"
                className="ml-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-95"
              >
                Get started
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-surface-container-highest bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
                close();
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          )}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-primary md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-surface-container-highest bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/listings" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
              Listings
            </Link>
            {isAuth && role === 'tenant' ? (
              <>
                <Link to="/tenant" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
                  Dashboard
                </Link>
                <Link to="/tenant/chatbot" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
                  Chatbot
                </Link>
              </>
            ) : null}
            {isAuth && role === 'landlord' ? (
              <Link to="/landlord" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
                Dashboard
              </Link>
            ) : null}
            {isAuth && role === 'admin' ? (
              <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
                Admin
              </Link>
            ) : null}
            {!isAuth ? (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={close}>
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="mt-1 rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-on-primary"
                  onClick={close}
                >
                  Get started
                </Link>
              </>
            ) : (
              <button
                type="button"
                className="mt-1 rounded-lg border border-surface-container-highest py-2.5 text-sm font-semibold"
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                  close();
                }}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
