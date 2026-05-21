import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-background">
      <PublicHeader variant="solid" />
      
      <main className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <header className="mb-16 text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl lg:text-6xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant">
            Have questions about NestFind? We're here to help you find your perfect home or manage your listings.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-on-surface">Contact Information</h2>
            <p className="text-on-surface-variant">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Phone</h3>
                  <p className="text-sm text-on-surface-variant">+254 746 612 495</p>
                  <p className="text-sm text-on-surface-variant">Mon-Fri from 8am to 5pm.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Email</h3>
                  <p className="text-sm text-on-surface-variant">hello@nestfind.co.ke</p>
                  <p className="text-sm text-on-surface-variant">support@nestfind.co.ke</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Office</h3>
                  <p className="text-sm text-on-surface-variant">Westlands Business Park</p>
                  <p className="text-sm text-on-surface-variant">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Working Hours</h3>
                  <p className="text-sm text-on-surface-variant">Weekdays: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-on-surface-variant">Saturdays: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-surface-container p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="font-bold text-on-surface">Live Chat Support</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Our support team is available via our built-in chatbot for logged-in tenants.
              </p>
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md hover:opacity-95">
                Start Chatting
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-8 shadow-lg md:p-10">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium text-on-surface">
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    placeholder="Jane"
                    className="w-full rounded-xl border border-surface-container-highest bg-surface px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium text-on-surface">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-xl border border-surface-container-highest bg-surface px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-on-surface">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="w-full rounded-xl border border-surface-container-highest bg-surface px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-on-surface">
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full rounded-xl border border-surface-container-highest bg-surface px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Support</option>
                  <option value="billing">Billing/M-Pesa</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-on-surface">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full rounded-xl border border-surface-container-highest bg-surface px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-on-primary shadow-lg transition hover:opacity-95"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <MarketFooter />
    </div>
  );
}
