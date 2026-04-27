import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Hash, Home, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useGetPaymentStatusQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGetPaymentStatusQuery(id as string, { 
    skip: !id,
    pollingInterval: 3000, // Automatic polling every 3 seconds
  });

  const status = (data as any)?.status;
  const isPending = status === 'pending' || status === 'pending_payment';
  const isSuccess = status === 'completed' || status === 'paid' || status === 'confirmed';
  const isFailed = status === 'failed';

  const ref =
    (data as { transactionId?: string } | undefined)?.transactionId ||
    (data as { payment?: { mpesaReceiptNumber?: string } } | undefined)?.payment?.mpesaReceiptNumber ||
    (data as { checkoutRequestId?: string } | undefined)?.checkoutRequestId ||
    `NF-${id}`;

  return (
    <AppLayout>
      <TopNav />
      <PageShell title={isSuccess ? "You're set" : "Processing"} hideHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto max-w-lg text-center">
            {isSuccess ? (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-fixed/50 text-secondary">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : isFailed ? (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error-container text-error">
                <AlertCircle className="h-10 w-10" />
              </div>
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed/50 text-primary">
                <Clock className="h-10 w-10 animate-pulse" />
              </div>
            )}

            <h1 className="font-headline mt-6 text-3xl font-extrabold text-on-surface">
              {isSuccess ? 'Booking confirmed' : isFailed ? 'Payment failed' : 'Processing payment...'}
            </h1>

            {isPending && (
              <p className="mt-4 text-sm text-on-surface-variant bg-surface-container-low p-4 rounded-xl border border-primary/10">
                Please check your phone for the M-Pesa prompt. Enter your PIN to complete the transaction. 
                This page will update automatically.
              </p>
            )}

            {isError ? (
              <p className="mt-2 text-sm text-on-surface-variant">We could not refresh payment status, but your booking id is recorded — check with admin or retry later.</p>
            ) : (
              <p className="mt-2 text-sm text-on-surface-variant">
                {isSuccess ? 'Your payment has been verified. You can now view your booking in the dashboard.' : 
                 isFailed ? 'The transaction was unsuccessful. Please try again or contact support if funds were deducted.' :
                 'Awaiting confirmation from M-Pesa...'}
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
              {isFailed && (
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-on-secondary shadow-md"
                >
                  Retry Payment
                </button>
              )}
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
