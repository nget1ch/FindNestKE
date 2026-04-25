import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bot, Home, ArrowUpRight, Sparkles } from 'lucide-react';
import type { RootState } from '../../store';
import { AppLayout, PageShell, TopNav } from './shared';

export default function TenantDashboardPage() {
  const user: any = useSelector((state: RootState) => state.auth.user);
  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title={`Welcome, ${user?.fullName || 'there'}`}
        subtitle="Start with the chatbot to narrow your search, or browse the full catalog when you are ready to compare on your own."
        eyebrow="Tenant hub"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/tenant/chatbot"
            className="group relative overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 shadow-sm transition hover:border-primary/30 hover:shadow-lg"
          >
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary-fixed/50 blur-2xl transition group-hover:bg-primary-fixed" />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Bot className="h-6 w-6" />
              </span>
              <h2 className="font-headline mt-4 text-xl font-bold text-on-surface">Start chatbot search</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                We ask for budget, area, type, and amenities so results are aligned with the listings database.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                Open chatbot <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
          <Link
            to="/listings"
            className="group relative overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 shadow-sm transition hover:border-primary/30 hover:shadow-lg"
          >
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-secondary-fixed/30 blur-2xl" />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container/30 text-primary">
                <Home className="h-6 w-6" />
              </span>
              <h2 className="font-headline mt-4 text-xl font-bold text-on-surface">Browse all listings</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                See active homes in a scannable grid with rent, area, and amenities — then open details to book.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                View catalog <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
        <div className="rounded-2xl border border-surface-container-highest bg-surface p-4 text-sm text-on-surface-variant">
          <p className="inline-flex items-center gap-2 font-medium text-on-surface">
            <Sparkles className="h-4 w-4 text-primary" />
            Tip
          </p>
          <p className="mt-1 pl-6">When you are ready, booking uses M-Pesa STK push for a small booking fee — your confirmation will include a reference.</p>
        </div>
      </PageShell>
    </AppLayout>
  );
}
