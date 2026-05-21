import { Link, useLocation } from 'react-router-dom';
import { formatKes } from '../../lib/nestfind';
import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';

export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const house = state?.house || { title: 'Savanna Horizon', houseId: 'SAV-88291-MP' };
  const bookingFee = house?.bookingFee || 5000;
  const transactionId = state?.transactionId || `SAV-${Math.floor(Math.random() * 100000)}-MP`;
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <PublicHeader variant="solid" />
      
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-12 md:py-20">
        {/* Success Hero Section */}
        <div className="mb-12 w-full max-w-2xl text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-lg">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Payment Successful
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-on-surface-variant">
            Your booking for {house.title} has been confirmed. We've sent a digital copy to your email.
          </p>
        </div>

        {/* Receipt & Details Grid */}
        <div className="grid w-full gap-8 md:grid-cols-12">
          {/* Left Column: Receipt Breakdown */}
          <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl md:col-span-7">
            <div className="p-8">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-outline">Transaction ID</span>
                  <span className="font-mono font-semibold text-primary">{transactionId}</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-outline">Date</span>
                  <span className="font-semibold">{date}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between text-on-surface">
                  <span className="text-lg">Property Viewing Fee</span>
                  <span className="font-bold">KSh {formatKes(bookingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <span>Service Charge (M-Pesa)</span>
                  <span>KSh 45.00</span>
                </div>
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <span>Regulatory VAT (16%)</span>
                  <span>KSh {formatKes(bookingFee * 0.16)}</span>
                </div>
                
                <div className="py-4">
                  <div className="h-px bg-surface-container" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">Total Paid</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-primary">KSh {formatKes(bookingFee + 45 + (bookingFee * 0.16))}</span>
                    <div className="mt-1 flex items-center justify-end font-medium text-secondary text-sm">
                      <span className="material-symbols-outlined mr-1 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Confirmed
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-surface-container-low p-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <span className="text-sm font-semibold">Download PDF Receipt</span>
              </div>
              <button className="font-bold text-primary hover:underline">Export</button>
            </div>
          </div>

          {/* Right Column: Next Steps */}
          <div className="space-y-8 md:col-span-5">
            <div className="overflow-hidden rounded-2xl bg-primary p-8 text-on-primary shadow-xl">
              <h4 className="mb-6 text-xl font-bold">What's Next?</h4>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white">Agent Assignment</p>
                    <p className="text-sm text-on-primary/80">An Estate Curator agent will contact you within 2 hours to confirm your arrival time.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">Entry Permits</p>
                    <p className="text-sm text-on-primary/80">You'll receive a digital gate pass via WhatsApp 30 minutes before your viewing.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-surface-container-high p-4">
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">headset_mic</span>
                <span className="text-sm font-medium">Need help?</span>
              </div>
              <a href="tel:+254700000000" className="text-sm font-bold text-primary hover:opacity-80">Call Concierge</a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:space-x-6">
          <Link
            to="/dashboard"
            className="rounded-full bg-primary px-10 py-4 text-center font-bold text-on-primary shadow-lg transition hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/tenant"
            className="rounded-full bg-surface-container-highest px-10 py-4 text-center font-bold text-primary transition hover:bg-surface-container-high"
          >
            View My Bookings
          </Link>
        </div>
      </main>

      <MarketFooter />
    </div>
  );
}
