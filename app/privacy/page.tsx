import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Tenerife Weather Forum collects, uses and protects your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-deep)" }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="px-6 py-16 text-center"
        style={{ background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-white/70 text-sm">Last updated: June 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <Section title="Who we are">
          <p>
            Tenerife Weather Forum (<strong style={{ color: "var(--color-deep)" }}>tenerifeweatherforum.com</strong>) is an
            independent Tenerife weather and travel community. We provide daily forecasts, travel guides and local
            information for visitors and residents.
          </p>
          <p>
            For privacy enquiries, please contact us at{" "}
            <a href="mailto:hello@tenerifeweatherforum.com" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
              hello@tenerifeweatherforum.com
            </a>
          </p>
        </Section>

        <Section title="What data we collect and why">
          <p><strong style={{ color: "var(--color-deep)" }}>Email address</strong> — if you subscribe to our newsletter, we store your email address and your subscription preferences (daily digest and/or monthly newsletter). This is used solely to send you the emails you signed up for. You can unsubscribe at any time via the link in any email.</p>
          <p><strong style={{ color: "var(--color-deep)" }}>Analytics data</strong> — we use Google Analytics to understand how visitors use the site (pages visited, time on site, device type, approximate location). This data is anonymised and aggregated. No personally identifiable information is shared with Google.</p>
          <p><strong style={{ color: "var(--color-deep)" }}>Cookies</strong> — we use cookies to remember your cookie consent preference (stored locally in your browser) and to support Google Analytics. We do not use advertising or tracking cookies beyond these.</p>
        </Section>

        <Section title="Affiliate links">
          <p>
            Some links on this site — particularly in the Excursions &amp; Activities section — are affiliate links
            provided by <strong style={{ color: "var(--color-deep)" }}>GetYourGuide</strong>. If you click one of these
            links and make a booking, we may earn a small commission at no extra cost to you. This helps us keep the
            site free and updated.
          </p>
          <p>
            Affiliate links are clearly indicated near the section where they appear. We only recommend activities
            and experiences we believe are genuinely useful to visitors.
          </p>
        </Section>

        <Section title="Webcam images">
          <p>
            The Live Webcams section displays photogram images from{" "}
            <strong style={{ color: "var(--color-deep)" }}>SkylineWebcams</strong> using their official embed feature.
            These are static snapshots from publicly accessible cameras that update every 5 minutes.
            No personal data is collected or processed in connection with these images.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>We use the following third-party services, each with their own privacy policies:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>
              <strong style={{ color: "var(--color-deep)" }}>Google Analytics</strong> —{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
                policies.google.com/privacy
              </a>
            </li>
            <li>
              <strong style={{ color: "var(--color-deep)" }}>GetYourGuide</strong> —{" "}
              <a href="https://www.getyourguide.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
                getyourguide.com/privacy-policy
              </a>
            </li>
            <li>
              <strong style={{ color: "var(--color-deep)" }}>SkylineWebcams</strong> —{" "}
              <a href="https://www.skylinewebcams.com/en/terms-of-use.html" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
                skylinewebcams.com/terms-of-use
              </a>
            </li>
          </ul>
        </Section>

        <Section title="How long we keep your data">
          <p>
            Email addresses are kept for as long as you remain subscribed. You can unsubscribe at any time and your
            address will be removed from our mailing list. Google Analytics data is retained for 14 months in line
            with their default settings.
          </p>
        </Section>

        <Section title="Your rights (GDPR)">
          <p>If you are based in the UK or European Union, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to or restrict how we process your data</li>
            <li>Withdraw consent at any time (e.g. unsubscribe from emails)</li>
            <li>Lodge a complaint with the ICO (UK) or your local data protection authority</li>
          </ul>
          <p>
            To exercise any of these rights, please email us at{" "}
            <a href="mailto:hello@tenerifeweatherforum.com" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
              hello@tenerifeweatherforum.com
            </a>
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page with an
            updated date at the top. Continued use of the site after changes are posted constitutes acceptance of
            the updated policy.
          </p>
        </Section>

        <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--color-mid)" }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
