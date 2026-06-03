import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "@/components/ui/SubscribeForm";
import { Camera, ArrowRight, MapPin, Sun, Wind, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Preview — New Homepage",
  robots: { index: false, follow: false },
};

/* ─── Data ──────────────────────────────────────────────────────────────── */

const guides = [
  {
    emoji: "📅",
    title: "Best Time to Visit",
    desc: "Month-by-month breakdown of weather, crowds and prices.",
    href: "/blog/best-time-to-visit",
    color: "#E8F4FD",
    accent: "#1A85C8",
  },
  {
    emoji: "🧳",
    title: "Tenerife Packing Guide",
    desc: "What to bring for every season — sun, wind and everything in between.",
    href: "/blog/packing-guide-tenerife",
    color: "#FEF3E2",
    accent: "#D4860B",
  },
  {
    emoji: "🌦️",
    title: "Microclimates Explained",
    desc: "Why it can rain in the north while the south basks in sunshine.",
    href: "/blog/microclimates-explained",
    color: "#E8F8F5",
    accent: "#1D9E7E",
  },
  {
    emoji: "🗺️",
    title: "North vs South Tenerife",
    desc: "Two completely different islands. Which side suits your holiday?",
    href: "/blog/north-vs-south-tenerife-weather",
    color: "#F2ECFB",
    accent: "#7C3AED",
  },
];

const excursions = [
  {
    emoji: "🎢",
    title: "Siam Park",
    desc: "Asia-inspired water park voted world's best. Thrilling slides, lazy rivers and wave pools for all ages.",
    gradFrom: "#0093E9",
    gradTo: "#80D0C7",
  },
  {
    emoji: "🐋",
    title: "Whale & Dolphin Watching",
    desc: "Year-round sightings of pilot whales and bottlenose dolphins in the waters off the southwest coast.",
    gradFrom: "#0D3A5C",
    gradTo: "#429ebd",
  },
  {
    emoji: "🌋",
    title: "Mount Teide Tour",
    desc: "Cable car to Spain's highest peak at 3,718m. Breathtaking panoramic views across all the Canary Islands.",
    gradFrom: "#C0392B",
    gradTo: "#E67E22",
  },
  {
    emoji: "🚙",
    title: "Jeep Safari Adventure",
    desc: "Off-road adventure through Tenerife's volcanic landscapes, banana plantations and hidden valleys.",
    gradFrom: "#5D4037",
    gradTo: "#8D6E63",
  },
  {
    emoji: "⛵",
    title: "Sunset Boat Trip",
    desc: "Sail along the south coast as the sun sets over the Atlantic. Live music, cocktails and sea views.",
    gradFrom: "#E74C3C",
    gradTo: "#F39C12",
  },
  {
    emoji: "🔭",
    title: "Stargazing at Teide",
    desc: "One of the world's finest stargazing locations. Expert guides, professional telescopes, and clear skies.",
    gradFrom: "#0F0C29",
    gradTo: "#302B63",
  },
];

const webcams = [
  { label: "Costa Adeje", sublabel: "Playa de las Américas" },
  { label: "Santa Cruz", sublabel: "City Harbour" },
  { label: "Mount Teide", sublabel: "Summit View" },
  { label: "El Médano", sublabel: "Surf Beach" },
  { label: "Puerto de la Cruz", sublabel: "Old Town" },
  { label: "Los Gigantes", sublabel: "Cliffs & Marina" },
];

const stats = [
  { icon: <Sun size={20} />, value: "300+", label: "Sunny days per year" },
  { icon: <MapPin size={20} />, value: "7", label: "Distinct microclimates" },
  { icon: <Wind size={20} />, value: "Daily", label: "Expert forecast posted" },
  { icon: <Waves size={20} />, value: "21°C", label: "Average sea temperature" },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function PreviewHomePage() {
  return (
    <>
      {/* Google Font — Cormorant Garamond for editorial display headlines */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');
        .twf-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .twf-card-lift { transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1); }
        .twf-card-lift:hover { transform: translateY(-5px); box-shadow: 0 24px 48px rgba(10,37,64,0.13); }
        .twf-excursion-btn { transition: background 0.2s, color 0.2s; }
        .twf-excursion-btn:hover { background: white !important; color: #0D3349 !important; }
        .twf-guide-card:hover .twf-guide-arrow { transform: translateX(3px); }
        .twf-guide-arrow { transition: transform 0.2s; }
        .twf-hero-ring { animation: twf-spin 60s linear infinite; }
        @keyframes twf-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        .twf-preview-badge {
          position: fixed; bottom: 80px; right: 16px; z-index: 9999;
          background: #0D3349; color: white; font-size: 11px;
          padding: 6px 12px; border-radius: 20px; font-weight: 600;
          letter-spacing: 0.04em; pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Preview badge — fixed corner reminder */}
      <div className="twf-preview-badge">PREVIEW</div>

      <div style={{ fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section
          className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden"
          style={{
            minHeight: "92vh",
            paddingTop: "120px",
            paddingBottom: "80px",
            paddingLeft: "24px",
            paddingRight: "24px",
            background: `
              radial-gradient(ellipse at 25% 85%, rgba(245,168,35,0.28) 0%, transparent 55%),
              radial-gradient(ellipse at 80% 15%, rgba(66,158,189,0.25) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 50%, rgba(13,78,110,0.4) 0%, transparent 70%),
              linear-gradient(155deg, #061B2E 0%, #0D3A5C 40%, #1A6080 70%, #0A2B42 100%)
            `,
          }}
        >
          {/* Decorative rings */}
          <div
            className="twf-hero-ring absolute pointer-events-none opacity-[0.07]"
            style={{
              width: 900, height: 900,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: "50%",
            }}
          />
          <div
            className="absolute pointer-events-none opacity-[0.05]"
            style={{
              width: 650, height: 650,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: "50%",
            }}
          />

          {/* Live indicator pill */}
          <div
            className="relative z-10 inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(245,168,35,0.18)",
              border: "1px solid rgba(245,168,35,0.38)",
              color: "#F5D87E",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#F5C842",
                boxShadow: "0 0 0 4px rgba(245,200,66,0.25)",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            Daily forecasts · Live weather · Travel guides
          </div>

          {/* Main headline */}
          <h1
            className="twf-display relative z-10 font-semibold leading-tight mb-5"
            style={{
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              maxWidth: "900px",
              letterSpacing: "-0.01em",
            }}
          >
            Your Tenerife{" "}
            <em
              className="italic block sm:inline"
              style={{ color: "#F5C842" }}
            >
              Weather Headquarters.
            </em>
          </h1>

          <p
            className="relative z-10 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.68)" }}
          >
            Expert daily forecasts from the island. Trusted by thousands of
            visitors and residents planning their perfect Tenerife stay.
          </p>

          {/* CTAs */}
          <div className="relative z-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/weather"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "#F5C842",
                color: "#0A2540",
                boxShadow: "0 4px 24px rgba(245,200,66,0.35)",
              }}
            >
              View Today&apos;s Forecast
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://www.facebook.com/groups/tenerife.weather.forum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "white",
              }}
            >
              Join Our Facebook Group
            </a>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "0.15em" }}
          >
            <span className="uppercase">Scroll</span>
            <div
              className="w-px"
              style={{
                height: 32,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: "#0D3349",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
                  style={{ background: "rgba(245,200,66,0.15)", color: "#F5C842" }}
                >
                  {s.icon}
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-none">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            QUICK ACCESS GUIDES
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#FAF7F2" }}>
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="mb-14 max-w-xl">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: "#D4860B" }}
              >
                Plan Your Trip
              </p>
              <h2
                className="twf-display font-semibold leading-tight mb-3"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: "#0D3349" }}
              >
                Essential Travel Guides
              </h2>
              <p style={{ color: "#6B7280" }}>
                Everything you need to know before and during your Tenerife trip.
              </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {guides.map((g) => (
                <Link
                  key={g.title}
                  href={g.href}
                  className="twf-card-lift twf-guide-card block rounded-2xl overflow-hidden bg-white"
                  style={{
                    boxShadow: "0 2px 12px rgba(10,37,64,0.07)",
                    border: "1px solid rgba(10,37,64,0.06)",
                  }}
                >
                  {/* Coloured top bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ background: g.accent }}
                  />
                  <div className="p-6">
                    {/* Emoji in tinted circle */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                      style={{ background: g.color }}
                    >
                      {g.emoji}
                    </div>
                    <h3
                      className="font-semibold text-base mb-2"
                      style={{ color: "#0D3349" }}
                    >
                      {g.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                      {g.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold twf-guide-arrow"
                      style={{ color: g.accent }}
                    >
                      Read guide <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            EXCURSIONS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#F0EDE5" }}>
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: "#D4860B" }}
                >
                  Things To Do
                </p>
                <h2
                  className="twf-display font-semibold leading-tight mb-3"
                  style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: "#0D3349" }}
                >
                  Excursions &amp; Activities
                </h2>
                <p style={{ color: "#6B7280", maxWidth: "420px" }}>
                  Hand-picked experiences for every type of visitor — from thrill-seekers to sunset lovers.
                </p>
              </div>
              <span
                className="text-xs self-start sm:self-auto px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(212,134,11,0.1)",
                  color: "#D4860B",
                  border: "1px solid rgba(212,134,11,0.2)",
                }}
              >
                Affiliate links coming soon
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {excursions.map((ex) => (
                <div
                  key={ex.title}
                  className="twf-card-lift rounded-2xl overflow-hidden bg-white"
                  style={{ boxShadow: "0 2px 16px rgba(10,37,64,0.09)" }}
                >
                  {/* Image placeholder — gradient with emoji */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      height: 160,
                      background: `linear-gradient(135deg, ${ex.gradFrom}, ${ex.gradTo})`,
                    }}
                  >
                    <span className="text-5xl" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
                      {ex.emoji}
                    </span>
                    {/* Subtle pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    {/* Placeholder image label */}
                    <div
                      className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded"
                      style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.7)" }}
                    >
                      Photo placeholder
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-base mb-2" style={{ color: "#0D3349" }}>
                      {ex.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                      {ex.desc}
                    </p>
                    <a
                      href="#"
                      className="twf-excursion-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold"
                      style={{ background: "#0D3349", color: "white" }}
                    >
                      Book Activity
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            WEBCAMS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#FAF7F2" }}>
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="mb-14 max-w-xl">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: "#D4860B" }}
              >
                Live Views
              </p>
              <h2
                className="twf-display font-semibold leading-tight mb-3"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: "#0D3349" }}
              >
                Tenerife Webcams
              </h2>
              <p style={{ color: "#6B7280" }}>
                See exactly what the weather looks like right now, from six different spots across the island.
              </p>
            </div>

            {/* Webcam grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {webcams.map((cam) => (
                <div
                  key={cam.label}
                  className="twf-card-lift rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 2px 14px rgba(10,37,64,0.09)" }}
                >
                  {/* Video placeholder */}
                  <div
                    className="relative flex flex-col items-center justify-center gap-3"
                    style={{
                      aspectRatio: "16/9",
                      background: "linear-gradient(145deg, #0D1F35, #0D3349, #0F4060)",
                    }}
                  >
                    {/* Scanline effect for realism */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
                      }}
                    />

                    {/* Camera icon */}
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      <Camera size={22} style={{ color: "rgba(255,255,255,0.45)" }} />
                    </div>

                    <div className="text-center z-10">
                      <p className="text-white font-semibold text-sm">{cam.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {cam.sublabel}
                      </p>
                    </div>

                    {/* Coming soon badge */}
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.35)" }}
                      />
                      Coming soon
                    </div>
                  </div>

                  {/* Card footer */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white"
                    style={{ borderTop: "1px solid rgba(10,37,64,0.07)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "#0D3349" }}>
                      {cam.label}
                    </span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      Live embed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            NEWSLETTER
        ══════════════════════════════════════════════════════════════════ */}
        <section
          className="py-24 px-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(150deg, #061B2E 0%, #0D3A5C 50%, #0A2B42 100%)",
          }}
        >
          {/* Background dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          {/* Golden glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 600,
              height: 600,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse, rgba(245,200,66,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-xl mx-auto text-center relative z-10">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#F5C842" }}
            >
              Stay Informed
            </p>
            <h2
              className="twf-display font-semibold leading-tight text-white mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
            >
              Get the Forecast
              <br />
              <em className="italic" style={{ color: "#F5C842" }}>
                in Your Inbox
              </em>
            </h2>
            <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.58)" }}>
              Daily weather updates and monthly travel guides — sent straight to you,
              every morning.
            </p>
            <SubscribeForm onDark compact />
          </div>
        </section>

        {/* Preview page footer note */}
        <div
          className="py-5 text-center text-xs"
          style={{
            background: "#061B2E",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.05em",
          }}
        >
          PREVIEW PAGE — Not linked from the live site · /preview/home
        </div>
      </div>
    </>
  );
}
