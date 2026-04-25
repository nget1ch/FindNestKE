import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bath, Bed, MapPin, Shield, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetHouseByIdQuery } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';
import { formatKes, getHouseImageUrl } from '../../lib/nestfind';
import type { RootState } from '../../store';
import { normalizeStoredRole } from '../../lib/roles';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const accountRole = normalizeStoredRole(user?.role);
  const canBook = !isAuth || accountRole === 'tenant';
  const { data: house, isLoading, error } = useGetHouseByIdQuery(id);
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    setActiveImg(0);
  }, [id]);
  const images = house?.images?.length ? house.images : [{ imageUrl: getHouseImageUrl(house) }];
  const main = images[activeImg]?.imageUrl || getHouseImageUrl(house);
  const fee = house?.bookingFee != null ? formatKes(house.bookingFee) : '500';

  return (
    <AppLayout>
      <TopNav />
      <PageShell title={house?.title || 'Property'} subtitle={isLoading ? 'Loading property…' : 'Review details, then book in two steps with M-Pesa.'} hideHeader>
        {isLoading ? (
          <div className="animate-pulse space-y-4 rounded-2xl border border-surface-container-highest bg-surface-container-lowest p-6">
            <div className="aspect-[16/10] rounded-xl bg-surface-dim" />
            <div className="h-4 w-1/2 rounded bg-surface-dim" />
            <div className="h-3 w-full rounded bg-surface-dim" />
          </div>
        ) : error || !house ? (
          <div className="rounded-2xl border border-surface-container-highest bg-surface-container-low p-8 text-center">
            <p className="text-on-surface">This listing is unavailable or could not be loaded.</p>
            <Link to="/listings" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
              ← Back to listings
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/listings"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              All listings
            </Link>
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="space-y-3 lg:col-span-3">
                <div className="overflow-hidden rounded-2xl border border-surface-container-highest shadow-md">
                  <img src={main} alt="" className="aspect-[16/10] w-full object-cover" />
                </div>
                {images.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((im: { imageUrl?: string }, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          activeImg === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={im.imageUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-4 rounded-2xl border border-surface-container-highest bg-surface-container-low p-6 shadow-sm">
                  <p className="font-headline text-3xl font-extrabold text-primary">KES {formatKes(house.monthlyRent)}</p>
                  <p className="text-sm text-on-surface-variant">per month · negotiable with landlord in person</p>
                  <p className="flex items-center gap-2 text-sm text-on-surface">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    {[house.location?.town, house.location?.county].filter(Boolean).join(', ') || 'Kenya'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-on-surface">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/40 px-3 py-1.5 text-primary">
                      <Bed className="h-4 w-4" />
                      {house.bedrooms} bed
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/40 px-3 py-1.5 text-primary">
                      <Bath className="h-4 w-4" />
                      {house.bathrooms} bath
                    </span>
                  </div>
                  <div className="rounded-xl border border-surface-container-highest bg-surface p-3 text-sm text-on-surface-variant">
                    <p className="flex items-center gap-2 font-medium text-on-surface">
                      <Shield className="h-4 w-4 text-secondary" />
                      Booking fee (M-Pesa)
                    </p>
                    <p className="mt-1 pl-6">KES {fee} — due at booking to secure your slot.</p>
                  </div>
                  {canBook ? (
                    <Link
                      to={`/tenant/booking/${house.houseId}`}
                      className="block w-full rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-on-primary shadow-md transition hover:opacity-95"
                    >
                      Book now
                    </Link>
                  ) : (
                    <p className="rounded-xl border border-surface-container-highest bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
                      Booking is available to tenant accounts only. Switch account or{' '}
                      <Link to="/register" className="font-semibold text-primary underline">
                        register as a tenant
                      </Link>{' '}
                      to book.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-surface-container-highest bg-surface-container-low p-6">
              <h2 className="font-headline text-lg font-bold text-on-surface">Description</h2>
              <p className="mt-3 leading-relaxed text-on-surface-variant">{house.description || 'The landlord will add a detailed description for this home.'}</p>
              {house.amenities ? (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-on-surface">Amenities</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{house.amenities}</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </PageShell>
    </AppLayout>
  );
}
