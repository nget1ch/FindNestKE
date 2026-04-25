import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function MarketFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-primary text-on-primary">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 font-headline text-lg font-bold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Home className="h-5 w-5" aria-hidden />
              </span>
              NestFind Kenya
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Chatbot-assisted house hunting, landlord listings, and M-Pesa booking — built for the Kenyan market.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider text-white/50">Product</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-white/80 hover:text-white" to="/listings">Browse listings</Link></li>
              <li><span className="text-white/50">Chatbot search</span> <span className="text-xs text-white/40">(tenants)</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider text-white/50">For professionals</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-white/80 hover:text-white" to="/register">List your property</Link></li>
              <li><span className="text-white/60">M-Pesa booking fee</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider text-white/50">Account</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-white/80 hover:text-white" to="/login">Sign in</Link></li>
              <li><Link className="text-white/80 hover:text-white" to="/register">Create account</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} NestFind Kenya. Academic project — Chatbot-Assisted House-Hunting.
        </p>
      </div>
    </footer>
  );
}
