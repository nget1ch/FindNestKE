import { Link } from 'react-router-dom';
import { Bot, Building2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';
import { IMAGES } from '../../lib/nestfind';

const features = [
  {
    icon: Bot,
    title: 'Chatbot search',
    body: 'Tell us your budget, preferred area, house type, and must-have amenities. We return listings that match.',
  },
  {
    icon: Building2,
    title: 'Verified-style listings',
    body: 'Landlords publish structured listings with rent, location, and amenities — easy to compare at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'M-Pesa booking',
    body: 'Secure a viewing with a transparent booking fee via STK push. You get a clear reference for your records.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-background">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(115deg, rgba(0,52,97,0.96) 0%, rgba(0,26,48,0.94) 45%, rgba(0,75,135,0.88) 100%), url(${IMAGES.hero})` }}
        />
        <div className="relative min-h-[88vh]">
          <PublicHeader variant="transparent" />
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6 md:pb-28 md:pt-36">
            <div className="max-w-2xl">
              <p className="font-label inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Chatbot-Assisted House-Hunting
              </p>
              <h1 className="font-headline mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                Curating Kenya's finest rental homes
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white md:text-lg">
                Find the right home faster: structured chatbot search, real listings, and M-Pesa booking — built for
                serious tenants and professional landlords.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/listings"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg transition hover:bg-white/95"
                >
                  Find a house
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/55 bg-white/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/35"
                >
                  List your property
                </Link>
                <Link to="/login" className="px-2 text-sm font-medium text-white underline-offset-4 hover:text-white">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="how" className="border-y border-surface-container-highest bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold text-on-surface">How NestFind works</h2>
            <p className="mt-3 text-on-surface-variant">Three clear steps. No noise — just search, book, and move.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="group rounded-2xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-sm transition hover:border-primary/45 hover:shadow-md"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed text-primary-container">
                  <f.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-headline mt-4 text-lg font-bold text-on-surface">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface">Built for the Kenyan rental market</h2>
              <p className="mt-3 text-on-surface-variant">
                M-Pesa is the default path for the booking fee. Listings are designed to be scannable, and the chatbot
                keeps preferences structured — so you spend less time scrolling and more time visiting real homes.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-on-surface">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Single booking flow per property (no duplicate holds).
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Role-based dashboards: tenant, landlord, and admin.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Clean data model: users, listings, bookings, and payments.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md hover:opacity-95"
                >
                  Create an account
                </Link>
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center rounded-xl border border-surface-container-highest bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary hover:bg-surface-container"
                >
                  Browse listings
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-surface-container-highest shadow-xl">
              <img
                src={IMAGES.auth}
                alt="Modern home interior and architecture"
                className="h-full min-h-[280px] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/55 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <MarketFooter />
    </div>
  );
}
