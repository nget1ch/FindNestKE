import { Link, useLocation } from 'react-router-dom';
import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';

export default function PaymentFailurePage() {
  const { state } = useLocation();
  const house = state?.house || { title: 'Savanna Horizon' };
  const refId = state?.refId || `EC-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}-X2`;
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <PublicHeader variant="solid" />

      <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-12 md:py-20">
        {/* Main Failure Card */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-lowest p-8 shadow-xl md:p-12">
          {/* Background Decorative Element */}
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-error-container/20 blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Status Icon */}
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-error-container shadow-sm">
              <span className="material-symbols-outlined text-4xl text-error" style={{ fontVariationSettings: "'wght' 600" }}>
                error_outline
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
              Transaction Not Completed
            </h1>
            <p className="mb-12 mt-4 max-w-md text-lg leading-relaxed text-on-surface-variant">
              We were unable to process your secure payment for {house.title}. Your security is our priority, and no funds have been debited from your account.
            </p>

            {/* Possible Reasons Grid */}
            <div className="mb-10 w-full rounded-2xl bg-surface-container-low p-6 text-left md:p-8">
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="material-symbols-outlined text-xl text-primary">info</span>
                Potential Reasons
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-error" />
                  <div>
                    <span className="mb-1 block font-semibold text-on-surface">Insufficient Funds</span>
                    <span className="text-sm text-on-surface-variant">The linked M-Pesa account may not have enough balance.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-error" />
                  <div>
                    <span className="mb-1 block font-semibold text-on-surface">Session Timed Out</span>
                    <span className="text-sm text-on-surface-variant">The secure payment gateway connection was interrupted.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-error" />
                  <div>
                    <span className="mb-1 block font-semibold text-on-surface">Transaction Cancelled</span>
                    <span className="text-sm text-on-surface-variant">You may have cancelled the STK push on your device.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-error" />
                  <div>
                    <span className="mb-1 block font-semibold text-on-surface">Invalid PIN</span>
                    <span className="text-sm text-on-surface-variant">The M-Pesa PIN entered was incorrect or the request expired.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cluster */}
            <div className="flex w-full flex-col items-center gap-4 md:flex-row">
              <button 
                onClick={() => window.history.back()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-on-primary shadow-lg transition hover:opacity-95 md:flex-1"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
                Retry Payment
              </button>
              <a href="tel:+254700000000" className="flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-bold text-primary transition hover:bg-surface-container-high md:w-auto">
                <span className="material-symbols-outlined text-xl">support_agent</span>
                Contact Support
              </a>
            </div>

            {/* Transaction Metadata */}
            <div className="mt-12 flex w-full flex-wrap justify-center gap-x-8 gap-y-2 border-t border-outline-variant/20 pt-8 opacity-60">
              <div className="flex items-center gap-2">
                <span className="font-label text-xs font-medium uppercase tracking-widest">Ref ID:</span>
                <span className="font-mono text-xs">{refId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs font-medium uppercase tracking-widest">Date:</span>
                <span className="font-mono text-xs">{date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <Link to="/listings" className="mt-8 text-sm font-semibold text-primary hover:underline">
          ← Browse more listings
        </Link>
      </main>

      <MarketFooter />
    </div>
  );
}
