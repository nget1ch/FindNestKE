import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';

type Props = { variant?: 'solid' | 'transparent' };

export default function PublicHeader({ variant = 'transparent' }: Props) {
  const [open, setOpen] = useState(false);
  const navLink =
    variant === 'transparent'
      ? 'text-white/90 hover:bg-white/10'
      : 'text-on-surface hover:bg-surface-container';

  return (
    <header
      className={
        variant === 'transparent'
          ? 'absolute left-0 right-0 top-0 z-30 border-b border-white/10 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-sm'
          : 'sticky top-0 z-30 border-b border-surface-container-highest bg-background/95 backdrop-blur'
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          to="/"
          className={`font-headline flex items-center gap-2 text-lg font-bold ${
            variant === 'transparent' ? 'text-white' : 'text-primary'
          }`}
        >
          <span
            className={
              variant === 'transparent'
                ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white'
                : 'bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-on-primary'
            }
          >
            <Home className="h-5 w-5" />
          </span>
          NestFind Kenya
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/listings"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${navLink}`}
          >
            Listings
          </Link>
          <a href="#how" className={`rounded-lg px-3 py-2 text-sm font-medium ${navLink}`}>
            How it works
          </a>
          <Link
            to="/login"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${navLink}`}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={`ml-1 rounded-lg px-4 py-2 text-sm font-semibold ${
              variant === 'transparent'
                ? 'bg-white text-primary shadow-md hover:bg-white/95'
                : 'bg-primary text-on-primary shadow-sm hover:opacity-95'
            }`}
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className={`rounded-lg p-2 md:hidden ${variant === 'transparent' ? 'text-white' : 'text-primary'}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div
          className={
            variant === 'transparent'
              ? 'border-t border-white/10 bg-slate-900/95 px-4 py-3 md:hidden'
              : 'border-t border-surface-container-highest bg-background px-4 py-3 md:hidden'
          }
        >
          <div className="flex flex-col gap-1">
            <Link
              to="/listings"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                variant === 'transparent' ? 'text-white/90' : 'text-on-surface'
              }`}
              onClick={() => setOpen(false)}
            >
              Listings
            </Link>
            <a
              href={variant === 'transparent' ? '/#how' : '#how'}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                variant === 'transparent' ? 'text-white/90' : 'text-on-surface'
              }`}
              onClick={() => setOpen(false)}
            >
              How it works
            </a>
            <Link
              to="/login"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                variant === 'transparent' ? 'text-white/90' : 'text-on-surface'
              }`}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className={`mt-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold ${
                variant === 'transparent' ? 'bg-white text-primary' : 'bg-primary text-on-primary'
              }`}
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
