import SubscribeForm from "@/components/ui/SubscribeForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe — Tenerife Weather Forum",
  description: "Get Tenerife's daily weather digest and monthly newsletter delivered to your inbox.",
};

export default function SubscribePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-12 relative overflow-hidden"
        style={{ background: "var(--gradient-ocean)" }}
      >
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Newsletter</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">
            Stay in the Loop
          </h1>
          <p className="text-white/65 text-lg max-w-xl">
            Get Tenerife&apos;s weather delivered to your inbox — a daily morning digest or a monthly guide to what&apos;s on.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: form */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 4px 24px rgba(5,63,92,0.07)",
            }}
          >
            <h2 className="font-700 text-xl mb-1" style={{ color: "var(--color-deep)" }}>
              Subscribe
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Choose one or both. You can unsubscribe from any email at any time.
            </p>
            <SubscribeForm />
          </div>

          {/* Right: what you get */}
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="text-2xl mb-3">🌅</div>
              <h3 className="font-700 text-base mb-2" style={{ color: "var(--color-deep)" }}>
                Daily Weather Digest
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
                Sent every morning at 7am. Each email includes:
              </p>
              <ul className="text-sm space-y-1.5" style={{ color: "var(--color-text-muted)" }}>
                {[
                  "Today's conditions for South and North Tenerife",
                  "Current temperature and high/low for the day",
                  "Wind speed and sea temperature",
                  "A short written outlook for the day",
                  "Any active weather warnings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "var(--color-mid)" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="text-2xl mb-3">📅</div>
              <h3 className="font-700 text-base mb-2" style={{ color: "var(--color-deep)" }}>
                Monthly Newsletter
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-muted)" }}>
                Sent on the 1st of each month. Each issue includes:
              </p>
              <ul className="text-sm space-y-1.5" style={{ color: "var(--color-text-muted)" }}>
                {[
                  "Climate overview for the month ahead",
                  "Typical temperatures, trade winds and rainfall",
                  "Events and festivals happening in Tenerife",
                  "Practical tips for visitors that month",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "var(--color-mid)" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              We never share your email. Unsubscribe from any email with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
