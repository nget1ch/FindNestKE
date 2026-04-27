import { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Smartphone, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useCreateMpesaPushMutation, useGetHouseByIdQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes, getHouseImageUrl } from '../../lib/nestfind';

export default function PaymentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState((location.state as { phone?: string } | null)?.phone || '');
  const [isWaiting, setIsWaiting] = useState(false);
  const [createMpesaPush] = useCreateMpesaPushMutation();
  const { data: house } = useGetHouseByIdQuery(id);
  const fee = house?.bookingFee != null ? formatKes(house.bookingFee) : '500';
  const img = house ? getHouseImageUrl(house) : '';

  const pay = async () => {
    setIsWaiting(true);
    
    // Attempt to send actual STK push
    try {
      await createMpesaPush({ houseId: Number(id), phone }).unwrap();
      toast.success('STK Push sent! Please check your phone.');
    } catch (err: any) {
      console.error('STK Push trigger failed:', err);
      const msg = err.data?.error || err.message || 'Check your internet or phone format';
      toast.error(`M-Pesa Error: ${msg}`, { duration: 5000 });
      // We continue to show the waiting screen for presentation even if it fails immediately
    }

    // Presentation countdown: wait 20 seconds then redirect to failure
    setTimeout(() => {
      setIsWaiting(false);
      navigate('/tenant/payment-failure', { state: { house } });
    }, 20000);
  };

  return (
    <AppLayout>
      {isWaiting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-6 flex items-center justify-center rounded-full bg-secondary/10">
              <Smartphone className="h-6 w-6 text-secondary animate-pulse" />
            </div>
          </div>
          <h3 className="mt-8 text-xl font-bold tracking-tight text-primary uppercase">Waiting for Transaction</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Check your phone for the M-Pesa prompt</p>
          <div className="mt-8 flex items-center gap-3 rounded-full bg-secondary/10 px-4 py-2 text-xs font-bold text-secondary">
            <Loader2 className="h-3 w-3 animate-spin" />
            SECURE GATEWAY ACTIVE
          </div>
          
          <div className="mt-12 w-48 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ animation: 'loading 20s linear forwards' }}></div>
          </div>
          <p className="mt-2 text-[10px] text-on-surface-variant/50 uppercase tracking-widest font-black">Connection expires in 20s</p>
        </div>
      )}
      <TopNav />
      <PageShell
        title="M-Pesa (STK push)"
        subtitle="A payment prompt is sent to your phone. Approve with your M-Pesa PIN. Do not share your PIN on this page."
        eyebrow="Step 2 of 2"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <Link
              to={id ? `/tenant/booking/${id}` : '/listings'}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit phone on booking step
            </Link>
            <div>
              <label className="text-xs font-bold" htmlFor="mpesa">Phone number</label>
              <div className="relative mt-1.5">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="mpesa"
                  className="w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest py-3 pl-9 pr-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  inputMode="tel"
                />
              </div>
            </div>
            <ol className="list-decimal space-y-2 pl-4 text-sm text-on-surface-variant">
              <li>Tap "Pay" below to trigger STK push.</li>
              <li>Check your phone for the M-Pesa prompt.</li>
              <li>Enter your M-Pesa PIN to confirm the booking fee.</li>
            </ol>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-sm font-bold text-on-secondary shadow-md transition hover:opacity-95 disabled:opacity-50"
              type="button"
              disabled={isWaiting || !phone.trim()}
              onClick={pay}
            >
              {isWaiting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Pay KES {fee} with M-Pesa</>
              )}
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-low p-0 shadow-sm">
            {house ? (
              <div>
                <img src={img} alt="" className="h-40 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-headline line-clamp-2 text-base font-bold">{house.title}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Booking fee to confirm interest</p>
                  <p className="mt-2 text-2xl font-extrabold text-primary">KES {fee}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-fixed/30 px-3 py-2 text-xs text-on-surface">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    You will be redirected to confirmation after a booking id is created.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-on-surface-variant">Loading property…</div>
            )}
          </div>
        </div>
      </PageShell>
    </AppLayout>
  );
}
