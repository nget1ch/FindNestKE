import { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Smartphone, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useCreateMpesaPushMutation, useGetHouseByIdQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes, getHouseImageUrl } from '../../lib/nestfind';

export default function PaymentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState((location.state as { phone?: string } | null)?.phone || '');
  const [createMpesaPush, { isLoading }] = useCreateMpesaPushMutation();
  const { data: house } = useGetHouseByIdQuery(id);
  const fee = house?.bookingFee != null ? formatKes(house.bookingFee) : '500';
  const img = house ? getHouseImageUrl(house) : '';

  const pay = async () => {
    try {
      const result: any = await createMpesaPush({ houseId: Number(id), phone }).unwrap();
      if (result.bookingId) {
        navigate('/tenant/payment-success', { state: { house, transactionId: result.transactionId } });
      } else {
        navigate('/tenant/payment-failure', { state: { house } });
      }
    } catch (err) {
      console.error('Payment failed:', err);
      navigate('/tenant/payment-failure', { state: { house } });
    }
  };

  return (
    <AppLayout>
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
              disabled={isLoading || !phone.trim()}
              onClick={pay}
            >
              {isLoading ? (
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
