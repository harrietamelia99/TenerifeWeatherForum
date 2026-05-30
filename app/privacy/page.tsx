import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Tenerife Weather Forum — how we collect, use and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="pt-36 sm:pt-40 pb-10 relative overflow-hidden"
        style={{ background: "var(--gradient-ocean)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">Privacy Policy</h1>
          <p className="text-white/65 text-lg">Last updated: May 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="prose prose-slate max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>1. Who we are</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Tenerife Weather Forum (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a weather information website for Tenerife,
              Canary Islands. The site is operated independently and accessible at{" "}
              <a href="https://www.tenerifeweatherforum.com" className="underline" style={{ color: "var(--color-sky)" }}>
                www.tenerifeweatherforum.com
              </a>.
              If you have any questions about this policy, contact us at{" "}
              <a href="mailto:hello@tenerifeweatherforum.com" className="underline" style={{ color: "var(--color-sky)" }}>
                hello@tenerifeweatherforum.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>2. What data we collect</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
              We only collect data that you voluntarily provide to us. This is limited to:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside" style={{ color: "var(--color-text-muted)" }}>
              <li>
                <strong>Email address</strong> — if you sign up for our daily weather digest or monthly newsletter.
              </li>
              <li>
                <strong>Subscription preferences</strong> — which newsletters you have opted into (daily digest, monthly newsletter, or both).
              </li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--color-text-muted)" }}>
              We do not collect names, payment information, or any other personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>3. How we use your data</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
              Your email address and subscription preferences are used solely to:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside" style={{ color: "var(--color-text-muted)" }}>
              <li>Send you the daily weather digest (if subscribed)</li>
              <li>Send you the monthly Tenerife weather newsletter (if subscribed)</li>
              <li>Process your unsubscribe requests</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--color-text-muted)" }}>
              We will never use your email for marketing unrelated to Tenerife Weather Forum, and we will never sell or share your data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>4. How we store your data</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Subscriber data is stored securely in{" "}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-sky)" }}>
                Supabase
              </a>
              , a trusted cloud database provider. Emails are sent via{" "}
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-sky)" }}>
                Resend
              </a>
              . Both services are GDPR-compliant and store data in secure, access-controlled environments. We retain your data only for as long as you remain subscribed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>5. Cookies and analytics</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              We use Google Analytics (GA4) to collect anonymised data about how visitors use the site — such as which pages are viewed and how long visitors stay. This data does not personally identify you. Google Analytics may use cookies to track sessions. You can opt out of Google Analytics tracking using the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-sky)" }}>
                Google Analytics opt-out browser add-on
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>6. Your rights</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
              Under UK and EU GDPR, you have the right to:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside" style={{ color: "var(--color-text-muted)" }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of any inaccurate data</li>
              <li>Request deletion of your data at any time</li>
              <li>Withdraw your consent to receive emails at any time</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--color-text-muted)" }}>
              Every email we send includes a one-click unsubscribe link. You can also email us at{" "}
              <a href="mailto:hello@tenerifeweatherforum.com" className="underline" style={{ color: "var(--color-sky)" }}>
                hello@tenerifeweatherforum.com
              </a>{" "}
              to request deletion of your data and we will action it within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>7. Third-party links</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Our site contains links to external websites (such as booking platforms, official tourism sites and weather services). We are not responsible for the privacy practices of those sites and recommend you review their policies separately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-700 mb-3" style={{ color: "var(--color-deep)" }}>8. Changes to this policy</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              We may update this policy from time to time. Any changes will be posted on this page with an updated date at the top. Continued use of the site after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <div
            className="rounded-2xl p-5 mt-8"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Questions about this policy?{" "}
              <a href="mailto:hello@tenerifeweatherforum.com" className="underline font-600" style={{ color: "var(--color-sky)" }}>
                hello@tenerifeweatherforum.com
              </a>
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="text-sm underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
