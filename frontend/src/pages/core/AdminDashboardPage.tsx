import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Users, Home, BookOpen, Banknote, Shield, ClipboardList, Check, X } from 'lucide-react';
import {
  useListUsersQuery,
  useGetHousesQuery,
  useGetBookingsQuery,
  useGetPaymentsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes } from '../../lib/nestfind';

export default function AdminDashboardPage() {
  const { data: users, isLoading: uLoad } = useListUsersQuery({});
  const { data: houses, isLoading: hLoad } = useGetHousesQuery({});
  const { data: pendingRaw, isLoading: pListLoad } = useGetHousesQuery({ status: 'pending_approval', limit: 100, page: 1 });
  const { data: bookings, isLoading: bLoad } = useGetBookingsQuery({});
  const { data: payments, isLoading: pLoad } = useGetPaymentsQuery({});
  const [approveListing, { isLoading: approveBusy }] = useApproveListingMutation();
  const [rejectListing, { isLoading: rejectBusy }] = useRejectListingMutation();
  const [feeByHouse, setFeeByHouse] = useState<Record<number, string>>({});

  const userItems = (users as any)?.items || users || [];
  const houseItems = (houses as any)?.items || houses || [];
  const pendingItems = (pendingRaw as any)?.items || pendingRaw || [];
  const bookingItems = (bookings as any) || [];
  const paymentItems = (payments as any) || [];

  const totalRevenue = Array.isArray(paymentItems)
    ? paymentItems.filter((p: any) => p.status === 'completed').reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0)
    : 0;

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Admin overview"
        subtitle="At-a-glance metrics for the academic scope: users, listings, bookings, and M-Pesa payments. Extend with moderation tools if your brief requires it."
        eyebrow="Control"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Users"
            value={uLoad ? '…' : String(userItems.length)}
            icon={Users}
            tone="from-primary/15 to-surface"
          />
          <StatCard
            label="Listings"
            value={hLoad ? '…' : String(houseItems.length)}
            icon={Home}
            tone="from-primary-fixed/30 to-surface"
          />
          <StatCard
            label="Bookings"
            value={bLoad ? '…' : String(bookingItems.length)}
            icon={BookOpen}
            tone="from-secondary-fixed/20 to-surface"
          />
          <StatCard
            label="Revenue (paid)"
            value={pLoad ? '…' : `KES ${formatKes(totalRevenue)}`}
            icon={Banknote}
            tone="from-tertiary-fixed/20 to-surface"
            small
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
          <div className="border-b border-surface-container-highest bg-surface p-4">
            <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-on-surface">
              <ClipboardList className="h-5 w-5 text-primary" />
              Pending listings
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Set a positive booking fee (KES) before approving. Reject sends the listing back to the landlord with a reason.
            </p>
          </div>
          {pListLoad ? (
            <div className="h-24 animate-pulse bg-surface-dim" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Rent</th>
                    <th className="px-3 py-2">Landlord</th>
                    <th className="px-3 py-2">Booking fee (KES)</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-on-surface-variant">
                        No listings awaiting approval.
                      </td>
                    </tr>
                  ) : (
                    pendingItems.map((h: any) => (
                      <tr key={h.houseId} className="border-b border-surface-container-highest last:border-0">
                        <td className="px-3 py-2 font-mono text-xs">#{h.houseId}</td>
                        <td className="px-3 py-2 font-medium text-on-surface">{h.title}</td>
                        <td className="px-3 py-2 tabular-nums">KES {formatKes(h.monthlyRent)}</td>
                        <td className="px-3 py-2 text-on-surface-variant">#{h.landlordId}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Required"
                            className="w-28 rounded-lg border border-surface-container-highest bg-surface-container-lowest px-2 py-1.5 text-sm"
                            value={feeByHouse[h.houseId] ?? ''}
                            onChange={(e) => setFeeByHouse((m) => ({ ...m, [h.houseId]: e.target.value }))}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={approveBusy || rejectBusy}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-on-primary disabled:opacity-50"
                              onClick={async () => {
                                const fee = parseFloat(feeByHouse[h.houseId] || '');
                                if (!Number.isFinite(fee) || fee <= 0) {
                                  window.alert('Enter a valid booking fee greater than zero before approving.');
                                  return;
                                }
                                try {
                                  await approveListing({ houseId: h.houseId, bookingFee: fee }).unwrap();
                                  setFeeByHouse((m) => {
                                    const n = { ...m };
                                    delete n[h.houseId];
                                    return n;
                                  });
                                } catch (e: any) {
                                  window.alert(e?.data?.error || e?.message || 'Approve failed');
                                }
                              }}
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={approveBusy || rejectBusy}
                              className="inline-flex items-center gap-1 rounded-lg border border-error/40 px-2.5 py-1.5 text-xs font-bold text-error disabled:opacity-50"
                              onClick={async () => {
                                const reason = window.prompt('Rejection reason (shown to landlord):', 'Does not meet guidelines');
                                if (reason === null) return;
                                try {
                                  await rejectListing({ houseId: h.houseId, reason: reason || 'No reason provided' }).unwrap();
                                } catch (e: any) {
                                  window.alert(e?.data?.error || e?.message || 'Reject failed');
                                }
                              }}
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
            <div className="border-b border-surface-container-highest bg-surface p-3">
              <h2 className="font-headline flex items-center gap-2 text-sm font-bold text-on-surface">
                <Users className="h-4 w-4" /> Users (first 8)
              </h2>
            </div>
            <div className="max-h-64 overflow-y-auto text-sm">
              {userItems.slice(0, 8).map((u: any) => (
                <div key={u.userId} className="flex items-center justify-between border-b border-surface-container-highest px-3 py-2.5 last:border-0">
                  <div>
                    <p className="font-medium text-on-surface">{u.fullName}</p>
                    <p className="text-xs text-on-surface-variant">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-surface-dim px-2 py-0.5 text-xs font-bold capitalize">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
            <div className="border-b border-surface-container-highest bg-surface p-3">
              <h2 className="font-headline flex items-center gap-2 text-sm font-bold text-on-surface">
                <BookOpen className="h-4 w-4" /> Recent bookings
              </h2>
            </div>
            <div className="max-h-64 overflow-y-auto text-sm">
              {bookingItems.slice(0, 8).map((b: any) => (
                <div key={b.bookingId} className="flex items-center justify-between border-b border-surface-container-highest px-3 py-2.5 last:border-0">
                  <span>#{b.bookingId} · house {b.houseId}</span>
                  <span className="text-xs font-bold text-primary">{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
          <div className="border-b border-surface-container-highest bg-surface p-3">
            <h2 className="font-headline flex items-center gap-2 text-sm font-bold text-on-surface">
              <Banknote className="h-4 w-4" /> Payments
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container-highest text-xs font-bold text-on-surface-variant">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Booking</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-on-surface-variant">
                      No payment rows in view.
                    </td>
                  </tr>
                ) : (
                  paymentItems.slice(0, 12).map((p: any) => (
                    <tr key={p.paymentId} className="border-b border-surface-container-highest last:border-0">
                      <td className="px-3 py-2 font-mono text-xs">#{p.paymentId}</td>
                      <td className="px-3 py-2">#{p.bookingId}</td>
                      <td className="px-3 py-2 tabular-nums">KES {formatKes(p.amount)}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-bold text-primary">{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-fixed/20 px-4 py-3 text-xs text-on-surface">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          This UI maps directly to the simplified academic data model. Wire deeper moderation only if your viva or documentation requires it.
        </p>
      </PageShell>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  small,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
  small?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-surface-container-highest bg-gradient-to-br ${tone} p-5 shadow-sm`}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
          <p className={`mt-1 font-headline font-extrabold text-on-surface ${small ? 'text-lg' : 'text-2xl'}`}>
            {value}
          </p>
        </div>
        <span className="rounded-xl bg-surface/80 p-2 shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </span>
      </div>
    </article>
  );
}
