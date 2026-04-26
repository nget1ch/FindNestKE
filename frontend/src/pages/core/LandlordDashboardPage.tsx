import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Trash2, Calendar, Home, LayoutDashboard, ShieldAlert } from 'lucide-react';
import type { RootState } from '../../store';
import { useDeleteHouseMutation, useGetBookingsQuery, useGetHousesQuery, useGetProfileQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes } from '../../lib/nestfind';

function statusStyle(s: string) {
  if (s === 'confirmed') return 'bg-secondary-fixed/60 text-secondary';
  if (s === 'pending_payment') return 'bg-tertiary-fixed/60 text-tertiary';
  return 'bg-surface-dim text-on-surface';
}

function statusLabel(s: string) {
  if (s === 'pending_approval') return 'Pending approval';
  if (s === 'active') return 'Approved (live)';
  return s;
}

export default function LandlordDashboardPage() {
  const authUser: any = useSelector((state: RootState) => state.auth.user);
  const { data: profileData } = useGetProfileQuery();
  const user = profileData?.user || authUser;
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading } = useGetHousesQuery({ 
    landlordId: user?.userId,
    page,
    limit: itemsPerPage
  });
  const { data: bookings, isLoading: bookLoading } = useGetBookingsQuery({ landlordId: user?.userId });
  const [deleteHouse] = useDeleteHouseMutation();

  const items = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const landlordBookings = (bookings as any) || [];

  const isApproved = user?.accountStatus === 'approved';

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Landlord dashboard"
        subtitle="Manage your properties and review booking activity."
        eyebrow="Portfolio"
      >
        {!isApproved ? (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-warning/45 bg-warning-fixed/25 p-5 text-on-surface">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-fixed/45 text-warning">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-headline font-bold">Verification Required</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Your account is under review. 
                  An administrator must verify your details before you can access the dashboard and publish new listings.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/landlord/listings/new"
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Create listing
            </Link>
          </div>

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-surface-dim" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
            <div className="border-b border-surface-container-highest bg-surface p-4">
              <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-on-surface">
                <Home className="h-5 w-5 text-primary" />
                My listings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Rent (KES)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="w-20 px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">
                        No listings yet — use Create listing to add your first property.
                      </td>
                    </tr>
                  ) : (
                    items.map((h: any) => (
                      <tr key={h.houseId} className="border-b border-surface-container-highest last:border-0">
                        <td className="px-4 py-3 font-medium text-on-surface">{h.title}</td>
                        <td className="px-4 py-3 tabular-nums text-on-surface">{formatKes(h.monthlyRent)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-surface-dim px-2.5 py-0.5 text-xs font-bold capitalize text-on-surface">
                            {statusLabel(h.status || '—')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this listing?')) void deleteHouse(h.houseId);
                            }}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-error hover:bg-error-container/30"
                            aria-label="Delete listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {total > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-surface-container-highest bg-surface p-4">
                <p className="text-xs text-on-surface-variant font-medium">
                  Showing <span className="font-bold text-primary">{items.length}</span> of <span className="font-bold text-primary">{total}</span> properties
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface disabled:opacity-65 disabled:cursor-not-allowed hover:bg-surface-dim transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <div className="flex items-center px-2 text-xs font-bold text-primary">
                    {page} / {Math.ceil(total / itemsPerPage)}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(total / itemsPerPage), p + 1))}
                    disabled={page >= Math.ceil(total / itemsPerPage)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container-highest bg-surface-container-lowest text-on-surface disabled:opacity-65 disabled:cursor-not-allowed hover:bg-surface-dim transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm">
          <div className="border-b border-surface-container-highest bg-surface p-4">
            <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-on-surface">
              <Calendar className="h-5 w-5 text-primary" />
              Bookings
            </h2>
          </div>
          {bookLoading ? (
            <div className="h-24 animate-pulse bg-surface-dim" />
          ) : (
            <ul className="divide-y divide-surface-container-highest">
              {landlordBookings.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-on-surface-variant">No booking activity yet.</li>
              ) : (
                landlordBookings.map((b: any) => (
                  <li key={b.bookingId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-on-surface">
                      <strong>#{b.bookingId}</strong> · House #{b.houseId}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle(b.status)}`}>{b.status}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
            <p className="text-center text-xs text-on-surface-variant">
              <LayoutDashboard className="inline h-3.5 w-3.5 align-text-bottom" /> Pending listings are reviewed in the admin dashboard before they appear to tenants.
            </p>
          </>
        )}
      </PageShell>
    </AppLayout>
  );
}
