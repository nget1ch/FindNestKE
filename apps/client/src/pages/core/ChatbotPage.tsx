import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Bot } from 'lucide-react';
import { useSendMessageMutation } from '../../store/apiSlice';
import { AppLayout, TopNav } from './shared';
import { formatKes, IMAGES } from '../../lib/nestfind';

export default function ChatbotPage() {
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [houseType, setHouseType] = useState('');
  const [amenities, setAmenities] = useState('');
  const [reply, setReply] = useState(
    "Hi — I'm your house-hunting assistant. Share your budget, area, and preferences, and I'll list homes that line up with what you need."
  );
  const [matches, setMatches] = useState<any[]>([]);
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const prompt = `Budget ${budget}, location ${location}, house type ${houseType}, amenities ${amenities}`;
    const result: any = await sendMessage({ message: prompt });
    setReply(result.data?.data?.reply || "I couldn't read a response. Try again in a moment.");
    setMatches(result.data?.data?.houses || []);
  };

  return (
    <AppLayout>
      <TopNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        <div className="mb-8 rounded-2xl border border-surface-container-highest bg-surface-container-low/90 p-6 shadow-sm">
          <p className="font-label text-xs font-bold uppercase tracking-wider text-primary">Chatbot</p>
          <h1 className="font-headline mt-1 text-2xl font-bold text-on-surface md:text-3xl">Assisted property search</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            We collect preferences in a clean form, then return listings that map to the database. Results appear live on
            the right.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <div className="min-h-[160px] rounded-2xl border border-surface-container-highest bg-gradient-to-b from-primary-fixed/40 to-surface-container-low p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <Bot className="h-5 w-5" />
                </span>
                <p className="text-sm leading-relaxed text-on-surface">{reply}</p>
              </div>
            </div>
            <form onSubmit={search} className="space-y-3 rounded-2xl border border-surface-container-highest bg-surface-container-low p-5 shadow-sm">
              <p className="font-label text-xs font-bold text-on-surface">Your criteria</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold" htmlFor="b">Budget (KES / month)</label>
                  <input
                    id="b"
                    className="mt-1 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 35000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold" htmlFor="l">Location</label>
                  <input
                    id="l"
                    className="mt-1 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Westlands, Karen…"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold" htmlFor="t">House type</label>
                  <input
                    id="t"
                    className="mt-1 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Bedsitter, 2BR…"
                    value={houseType}
                    onChange={(e) => setHouseType(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold" htmlFor="a">Amenities</label>
                  <input
                    id="a"
                    className="mt-1 w-full rounded-xl border border-surface-container-highest bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Parking, water…"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-on-primary shadow-md transition hover:opacity-95 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Searching…' : (
                  <>
                    <Search className="h-4 w-4" />
                    Find matches
                  </>
                )}
              </button>
            </form>
          </div>

          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">Recommended listings</h2>
              <span className="rounded-full bg-surface-dim px-2.5 py-0.5 text-xs font-bold text-on-surface">
                {matches.length}
              </span>
            </div>
            <div className="grid max-h-[min(70vh,640px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {matches.length === 0 ? (
                <div className="col-span-2 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-container-highest bg-surface-container-low/80 py-12 text-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <p className="mt-2 max-w-sm text-sm text-on-surface-variant">Run a search to show property cards that match your criteria.</p>
                </div>
              ) : (
                matches.map((house) => (
                  <Link
                    key={house.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-surface-container-highest bg-surface-container-lowest shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    to={`/listings/${house.id}`}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={IMAGES.card}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <p className="font-headline line-clamp-2 text-sm font-bold text-on-surface">{house.title}</p>
                      <p className="mt-1 text-xs font-bold text-primary">KES {formatKes(house.rent)} / mo</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
                        <MapPin className="h-3 w-3" />
                        {house.county || 'Kenya'}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
