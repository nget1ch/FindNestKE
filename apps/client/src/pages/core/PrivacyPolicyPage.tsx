import PublicHeader from '../../components/nestfind/PublicHeader';
import MarketFooter from '../../components/nestfind/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-background">
      <PublicHeader variant="solid" />
      
      <main className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <header className="mb-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Last updated: April 27, 2026
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-12">
          <section className="rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface m-0">Introduction</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              At NestFind Kenya, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our chatbot-assisted house-hunting service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Information We Collect</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-surface-container-highest p-6">
                <h3 className="text-lg font-semibold text-on-surface mb-2">Personal Data</h3>
                <p className="text-sm text-on-surface-variant">
                  Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                </p>
              </div>
              <div className="rounded-2xl border border-surface-container-highest p-6">
                <h3 className="text-lg font-semibold text-on-surface mb-2">Financial Data</h3>
                <p className="text-sm text-on-surface-variant">
                  Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface m-0">Security of Your Information</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Contact Us</h2>
            <p className="text-on-surface-variant">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-surface-container rounded-2xl p-6">
              <p className="font-semibold text-on-surface">NestFind Kenya</p>
              <p className="text-on-surface-variant">Email: privacy@nestfind.co.ke</p>
              <p className="text-on-surface-variant">Phone: +254 746 612 495</p>
              <p className="text-on-surface-variant">Nairobi, Kenya</p>
            </div>
          </section>
        </div>
      </main>

      <MarketFooter />
    </div>
  );
}
