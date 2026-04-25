import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { useCreateHouseMutation } from '../../store/apiSlice';
import { AppLayout, PageShell, TopNav } from './shared';

const HOUSE_TYPES: { value: string; label: string }[] = [
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'studio', label: 'Studio' },
  { value: 'one_bedroom', label: '1 bedroom' },
  { value: 'two_bedroom', label: '2 bedroom' },
  { value: 'three_bedroom', label: '3 bedroom' },
  { value: 'four_bedroom_plus', label: '4+ bedroom' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'mansion', label: 'Mansion' },
];

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'gym', label: 'Gym' },
  { id: 'swimming_pool', label: 'Swimming pool' },
  { id: 'parking', label: 'Parking' },
  { id: 'security', label: 'Security' },
] as const;

const NEARBY_OPTIONS = [
  { id: 'malls', label: 'Malls' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'schools', label: 'Schools' },
  { id: 'churches', label: 'Churches' },
  { id: 'mosque', label: 'Mosque' },
] as const;

const AREA_OPTIONS = [
  { value: 'urban', label: 'Urban' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'rural_quiet', label: 'Forest-like / quiet' },
] as const;

const inputClass =
  'mt-1.5 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelClass = 'font-label text-xs font-bold text-on-surface';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [createHouse, { isLoading, error }] = useCreateHouseMutation();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [houseType, setHouseType] = useState('one_bedroom');
  const [bedrooms, setBedrooms] = useState('1');
  const [amenities, setAmenities] = useState<Set<string>>(new Set());
  const [nearby, setNearby] = useState<Set<string>>(new Set());
  const [areaCharacter, setAreaCharacter] = useState<'urban' | 'suburban' | 'rural_quiet'>('urban');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!location.trim()) {
      setFormError('Location is required.');
      return;
    }
    const rent = Number(monthlyRent);
    if (!Number.isFinite(rent) || rent <= 0) {
      setFormError('Rent must be a positive number.');
      return;
    }
    const br = Number(bedrooms);
    if (!Number.isFinite(br) || br < 0) {
      setFormError('Bedrooms must be a valid number.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('location', location.trim());
    fd.append('monthlyRent', String(rent));
    fd.append('houseType', houseType);
    fd.append('bedrooms', String(br));
    fd.append('bathrooms', '1');
    fd.append('furnishing', 'unfurnished');
    fd.append('areaCharacter', areaCharacter);
    if (description.trim()) fd.append('description', description.trim());
    amenities.forEach((a) => fd.append('amenities', a));
    nearby.forEach((n) => fd.append('nearbyFacilities', n));
    files.forEach((f) => fd.append('images', f));

    const result: any = await createHouse(fd);
    if (result.error) {
      const err = result.error as { data?: { error?: string; detail?: string; code?: string } };
      setFormError(
        err.data?.error ||
          err.data?.detail ||
          (typeof err.data === 'string' ? err.data : null) ||
          'Could not submit listing. Check all fields and try again.'
      );
      return;
    }
    navigate('/landlord');
  };

  return (
    <AppLayout>
      <TopNav />
      <PageShell
        title="Create listing"
        subtitle="Submit details for review. Your property stays private until an admin approves it and sets the booking fee."
        eyebrow="New property"
      >
        <Link
          to="/landlord"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-sm">
          <div>
            <label className={labelClass} htmlFor="title">
              Title of property
            </label>
            <input id="title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Westlands, Nairobi"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="rent">
                Monthly rent (KES)
              </label>
              <input
                id="rent"
                type="number"
                min={1}
                step={1}
                className={inputClass}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="bedrooms">
                Bedrooms
              </label>
              <input
                id="bedrooms"
                type="number"
                min={0}
                className={inputClass}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="houseType">
              House type
            </label>
            <select id="houseType" className={inputClass} value={houseType} onChange={(e) => setHouseType(e.target.value)}>
              {HOUSE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className={labelClass}>Amenities</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {AMENITY_OPTIONS.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={amenities.has(o.id)}
                    onChange={() => setAmenities(toggle(amenities, o.id))}
                    className="h-4 w-4 rounded border-surface-container-highest text-primary"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Nearby facilities</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {NEARBY_OPTIONS.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={nearby.has(o.id)}
                    onChange={() => setNearby(toggle(nearby, o.id))}
                    className="h-4 w-4 rounded border-surface-container-highest text-primary"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className={labelClass} htmlFor="area">
              Area character
            </label>
            <select id="area" className={inputClass} value={areaCharacter} onChange={(e) => setAreaCharacter(e.target.value as typeof areaCharacter)}>
              {AREA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="desc">
              Additional notes (optional)
            </label>
            <textarea id="desc" className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className={labelClass} htmlFor="imgs">
              Property photos (optional)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-surface-container-highest px-4 py-3 text-sm font-medium text-primary hover:bg-surface-container">
                <Upload className="h-4 w-4" />
                Choose files
                <input
                  id="imgs"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
              {files.length > 0 ? (
                <span className="text-xs text-on-surface-variant">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
              ) : null}
            </div>
          </div>

          {(formError || (error as any)?.data?.error) && (
            <p className="rounded-xl border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
              {formError || (error as any)?.data?.error || 'Something went wrong.'}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Submitting…' : 'Submit for approval'}
            </button>
            <Link
              to="/landlord"
              className="inline-flex items-center justify-center rounded-xl border border-surface-container-highest px-6 py-3 text-sm font-bold text-on-surface"
            >
              Cancel
            </Link>
          </div>

          <p className="text-xs text-on-surface-variant">
            Booking fee is set only by an admin when they approve this listing. Tenants only see listings after approval.
          </p>
        </form>
      </PageShell>
    </AppLayout>
  );
}
