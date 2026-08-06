import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Tenerife Weather Forum, including the Lucky Spin prize promotion.",
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

export default function TermsPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="px-6 py-16 text-center"
        style={{ background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms &amp; Conditions</h1>
        <p className="text-white/70 text-sm">Last updated: August 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <Section title="About this site">
          <p>
            Tenerife Weather Forum (<strong style={{ color: "var(--color-deep)" }}>tenerifeweatherforum.com</strong>) is an
            independent Tenerife weather and travel community run by Kevin Clark. We provide daily forecasts, travel
            guides, local information, airport updates and holiday advice for visitors and residents.
          </p>
          <p>
            By using this website you agree to these terms. If you do not agree, please do not use the site.
          </p>
          <p>
            For any questions, contact us at{" "}
            <a href="mailto:hello@tenerifeweatherforum.com" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
              hello@tenerifeweatherforum.com
            </a>
          </p>
        </Section>

        <Section title="Weather information">
          <p>
            All weather forecasts and climate information published on this site are provided in good faith for general
            guidance only. They are not a substitute for official meteorological advice from AEMET or the UK Met Office.
          </p>
          <p>
            We accept no liability for decisions made based on weather information published on this site. Always check
            official forecasts before travelling, undertaking outdoor activities, or making time-sensitive plans.
          </p>
        </Section>

        <Section title="Affiliate links">
          <p>
            Some links on this site — particularly in the Excursions &amp; Activities section — are affiliate links
            provided by <strong style={{ color: "var(--color-deep)" }}>GetYourGuide</strong>. If you click one of these
            links and make a booking, we may earn a small commission at no extra cost to you.
          </p>
          <p>
            We only recommend activities and experiences we believe are genuinely useful to visitors. Affiliate links
            are indicated near the section where they appear.
          </p>
        </Section>

        <Section title="Newsletter">
          <p>
            By subscribing to our newsletter you consent to receiving email communications from Tenerife Weather Forum.
            You can unsubscribe at any time via the link in any email. We will not share your email address with third
            parties for marketing purposes. See our{" "}
            <Link href="/privacy" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
              Privacy Policy
            </Link>{" "}
            for full details.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            All written content, graphics, and branding on this site are the property of Tenerife Weather Forum unless
            otherwise stated. You may not reproduce or republish any content without prior written permission.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, Tenerife Weather Forum shall not be liable for any indirect,
            incidental, or consequential loss or damage arising from use of this website or reliance on information
            published here.
          </p>
        </Section>

        {/* ── Lucky Spin T&Cs ────────────────────────────────────────────────────── */}
        <div id="lucky-spin" className="my-12 border-t border-b py-2" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-xl font-black text-center py-6" style={{ color: "var(--color-deep)" }}>
            Lucky Spin — Prize Promotion Terms &amp; Conditions
          </h2>
        </div>

        <Section title="The promotion">
          <p>
            Lucky Spin is a free-to-enter monthly prize promotion operated by Tenerife Weather Forum
            (<strong style={{ color: "var(--color-deep)" }}>tenerifeweatherforum.com</strong>). It is not operated by,
            affiliated with, or endorsed by GetYourGuide, Google, Facebook, TikTok, or any other third party.
          </p>
          <p>
            Participation is free of charge. No purchase is necessary to enter.
          </p>
        </Section>

        <Section title="Eligibility">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Participants must be aged 18 or over.</li>
            <li>Participants must register for a Lucky Spin account with a valid email address.</li>
            <li>Employees and immediate family members of Tenerife Weather Forum are not eligible.</li>
            <li>The promoter reserves the right to verify the identity of any winner.</li>
          </ul>
        </Section>

        <Section title="How to enter">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Create a free account at <Link href="/spin" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>tenerifeweatherforum.com/spin</Link>.</li>
            <li>Each registered user is entitled to one free spin every 24 hours.</li>
            <li>Newsletter subscribers receive one additional bonus spin, credited automatically upon subscribing.</li>
            <li>
              Each spin awards points based on the segment the wheel lands on. Points are determined by a
              weighted random selection performed server-side. The visual spin animation illustrates the result —
              the outcome is decided before the wheel stops.
            </li>
            <li>
              <strong style={{ color: "var(--color-deep)" }}>"Spin Again"</strong> results do not award points and do
              not count as a daily spin — an additional free spin is granted immediately.
            </li>
          </ul>
        </Section>

        <Section title="The leaderboard and winners">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Points accumulate on a monthly leaderboard. The leaderboard resets to zero at the end of each calendar month.</li>
            <li>The top 3 players by monthly points at the time of the monthly reset are the winners.</li>
            <li>
              In the event of a tie on points, the player who reached that score first (based on the timestamp of
              their last spin) is ranked higher.
            </li>
            <li>Monthly points reset to zero after archiving. Lifetime points are retained permanently on each account.</li>
          </ul>
        </Section>

        <Section title="Prizes">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Prizes for each monthly promotion are confirmed and announced by the promoter at the start of, or during, each monthly period.</li>
            <li>Prizes are non-transferable and there is no cash alternative.</li>
            <li>Winners are notified by email to the address registered on their Lucky Spin account.</li>
            <li>Winners must respond within 14 days of notification to claim their prize. Failure to respond within this period may result in the prize being forfeited.</li>
            <li>The promoter reserves the right to substitute any prize with one of equal or greater value.</li>
          </ul>
        </Section>

        <Section title="Fair play">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>Each account is limited to one spin per 24-hour period. Attempts to circumvent this limit (e.g. by creating multiple accounts) will result in disqualification.</li>
            <li>The promoter reserves the right to disqualify any participant found to be abusing the system, using automated tools, or acting in bad faith.</li>
            <li>All spin outcomes are determined by a server-side weighted random algorithm. Results cannot be influenced by the player.</li>
          </ul>
        </Section>

        <Section title="Data and privacy">
          <p>
            By registering for a Lucky Spin account you agree to the collection and storage of your email address,
            chosen display name, spin history, and points total. Your display name (or email address if no display
            name is set) will appear publicly on the leaderboard. See our{" "}
            <Link href="/privacy" className="underline hover:opacity-80" style={{ color: "var(--color-mid)" }}>
              Privacy Policy
            </Link>{" "}
            for full details on how your data is used and your rights.
          </p>
        </Section>

        <Section title="Changes and cancellation">
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>The promoter reserves the right to amend these terms, modify the promotion, or cancel it at any time without prior notice, in the event of circumstances beyond its control.</li>
            <li>The promoter&apos;s decision on all matters relating to the promotion is final.</li>
            <li>These terms are governed by the laws of England and Wales.</li>
          </ul>
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
