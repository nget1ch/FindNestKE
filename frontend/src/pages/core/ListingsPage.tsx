import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { useGetHousesQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes, getHouseImageUrl } from '../../lib/nestfind';

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest">
      <div className="h-48 animate-pulse bg-surface-dim" />
      <div className="p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-dim" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-dim" />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [q, setQ] = useState('');
  const { data, isLoading, isFetching } = useGetHousesQuery({ status: 'active' });
  const items = (data as any)?.items || data || [];

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (h: any) =>
        h.title?.toLowerCase().includes(s) ||
        h.amenities?.toLowerCase().includes(s) ||
        h.location?.town?.toLowerCase().includes(s) ||
        h.location?.county?.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Listings"
        subtitle="Hand-picked, active properties. Open a card for full details and booking."
        eyebrow="Discover"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, area, or amenity"
              className="w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest py-3 pl-10 pr-4 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {isFetching && !isLoading ? (
            <p className="text-xs font-medium text-on-surface-variant">Updating…</p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-low px-6 py-14 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <p className="font-headline mt-3 text-lg font-semibold text-on-surface">No listings match</p>
            <p className="mt-1 text-sm text-on-surface-variant">Try another keyword or check back when landlords add homes.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((house: any) => {
              const img = getHouseImageUrl(house);
              const place =
                [house.location?.town, house.location?.county].filter(Boolean).join(', ') || 'Nairobi, Kenya';
              return (
                <Link
                  to={`/listings/${house.houseId}`}
                  key={house.houseId}
                  className="group overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                      KES {formatKes(house.monthlyRent)}/mo
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-headline line-clamp-2 text-base font-bold text-on-surface group-hover:text-primary">{house.title}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {place}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-on-surface-variant">{house.amenities || 'Amenities on request'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageShell>
    </AppLayout>
  );
}
