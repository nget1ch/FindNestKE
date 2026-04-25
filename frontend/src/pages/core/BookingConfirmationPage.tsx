import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Hash, Home, ArrowRight, Loader2 } from 'lucide-react';
import { useGetPaymentStatusQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPaymentStatusQuery(id as string, { skip: !id });
  const ref =
    (data as { transactionId?: string; status?: string } | undefined)?.transactionId ||
    (data as { payment?: { mpesaReceiptNumber?: string } } | undefined)?.payment?.mpesaReceiptNumber ||
    (data as { checkoutRequestId?: string } | undefined)?.checkoutRequestId ||
    `NF-${id}`;

  return (
    <AppLayout>
      <TopNav />
      <PageShell title="You're set" hideHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-fixed/50 text-secondary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="font-headline mt-6 text-3xl font-extrabold text-on-surface">Booking confirmed</h1>
            {isError ? (
              <p className="mt-2 text-sm text-on-surface-variant">We could not refresh payment status, but your booking id is recorded — check with admin or retry later.</p>
            ) : (
              <p className="mt-2 text-sm text-on-surface-variant">
                A reference is available below. M-Pesa receipt may take a few seconds to sync after the callback.
              </p>
            )}
            <div className="mt-8 rounded-2xl border border-surface-container-highest bg-surface-container-low p-5 text-left shadow-sm">
              <p className="font-label text-xs font-bold text-primary">Reference</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-lg font-bold text-on-surface">
                <Hash className="h-5 w-5 text-primary" />
                {String(ref)}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-container-highest bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface"
              >
                <Home className="h-4 w-4" />
                More listings
              </Link>
              <Link
                to="/tenant"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-md"
              >
                Go to my dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </PageShell>
    </AppLayout>
  );
}
