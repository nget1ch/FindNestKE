import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Phone, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { useGetHouseByIdQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes, getHouseImageUrl } from '../../lib/nestfind';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const { data: house, isLoading } = useGetHouseByIdQuery(id);
  const fee = house?.bookingFee != null ? formatKes(house.bookingFee) : '500';
  const img = house ? getHouseImageUrl(house) : '';

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Confirm booking"
        subtitle="We take your M-Pesa number on the next step for STK push. One active booking is enforced per property flow where applicable."
        eyebrow="Step 1 of 2"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !house ? (
          <p className="text-on-surface">Listing not found. <Link className="font-semibold text-primary" to="/listings">Back to listings</Link></p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold" htmlFor="phone">M-Pesa phone number</label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="phone"
                    className="w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest py-3 pl-9 pr-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="2547XXXXXXXX"
                    inputMode="tel"
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">Use a Safaricom number registered for M-Pesa. Format: 2547XXXXXXXX</p>
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95"
                type="button"
                onClick={() => {
                  if (!phone.trim() || phone.length < 10) {
                    toast.error('Please enter a valid M-Pesa phone number (e.g. 2547XXXXXXXX)');
                    return;
                  }
                  navigate(`/tenant/payment/${id}`, { state: { phone } });
                }}
              >
                Proceed to payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-low shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <img src={img} alt="" className="h-48 w-full object-cover sm:h-full" />
                </div>
                <div className="p-5 sm:col-span-3">
                  <h3 className="font-headline text-lg font-bold text-on-surface line-clamp-2">{house.title}</h3>
                  <p className="mt-1 text-2xl font-extrabold text-primary">KES {formatKes(house.monthlyRent)}<span className="text-sm font-medium text-on-surface-variant"> /mo</span></p>
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-surface-container-highest bg-surface p-3 text-sm text-on-surface-variant">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>
                      Booking fee <strong className="text-on-surface">KES {fee}</strong> — held until payment is confirmed on your device.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </AppLayout>
  );
}
