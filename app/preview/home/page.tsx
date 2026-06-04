import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "@/components/ui/SubscribeForm";
import {
  Camera,
  ArrowRight,
  Calendar,
  Luggage,
  CloudSun,
  Map,
  Anchor,
  Mountain,
  Car,
  Sailboat,
  Telescope,
  Waves,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Preview — New Homepage",
  robots: { index: false, follow: false },
};

/* ─── Data ───────────────────────────────────────────────────────────────── */

const guides = [
  {
    icon: <Calendar size={22} />,
    label: "Best Time to Visit",
    desc: "Month-by-month breakdown of weather, crowds and prices.",
    href: "/blog/best-time-to-visit",
    gradient: "linear-gradient(135deg, #9fe7f5, #429ebd)",
  },
  {
    icon: <Luggage size={22} />,
    label: "Tenerife Packing Guide",
    desc: "What to bring for every season — sun, wind and everything in between.",
    href: "/blog/packing-guide-tenerife",
    gradient: "linear-gradient(135deg, #f7ad19, #429ebd)",
  },
  {
    icon: <CloudSun size={22} />,
    label: "Microclimates Explained",
    desc: "Why it can rain in the north while the south basks in sunshine.",
    href: "/blog/microclimates-explained",
    gradient: "linear-gradient(135deg, #9fe7f5, #053f5c)",
  },
  {
    icon: <Map size={22} />,
    label: "North vs South Tenerife",
    desc: "Two completely different islands — which side suits your holiday?",
    href: "/blog/north-vs-south-tenerife-weather",
    gradient: "linear-gradient(135deg, #429ebd, #053f5c)",
  },
];

const excursions = [
  {
    icon: <Waves size={24} />,
    title: "Siam Park",
    desc: "Asia-inspired water park voted world's best. Slides, wave pools and lazy rivers for all ages.",
    gradient: "linear-gradient(135deg, #9fe7f5, #429ebd)",
    href: "https://gyg.me/DaRn8YVu",
  },
  {
    icon: <Anchor size={24} />,
    title: "Whale & Dolphin Watching",
    desc: "Year-round sightings of pilot whales and bottlenose dolphins off the southwest coast.",
    gradient: "linear-gradient(135deg, #429ebd, #053f5c)",
    href: "https://gyg.me/zPK1aMuo",
  },
  {
    icon: <Mountain size={24} />,
    title: "Mount Teide Tour",
    desc: "Cable car to Spain's highest peak at 3,718m with breathtaking views across the Canary Islands.",
    gradient: "linear-gradient(135deg, #f7ad19, #429ebd)",
    href: "https://gyg.me/IXLcOg8V",
  },
  {
    icon: <Car size={24} />,
    title: "Jeep Safari Adventure",
    desc: "Off-road through volcanic landscapes, banana plantations and hidden valleys.",
    gradient: "linear-gradient(135deg, #9fe7f5, #f7ad19)",
    href: "https://gyg.me/UFq9ct9V",
  },
  {
    icon: <Sailboat size={24} />,
    title: "Sunset Boat Trip",
    desc: "Sail along the south coast as the sun sets over the Atlantic. Cocktails and sea views included.",
    gradient: "linear-gradient(135deg, #f7ad19, #053f5c)",
    href: "https://gyg.me/CvkPIN9C",
  },
  {
    icon: <Telescope size={24} />,
    title: "Stargazing at Teide",
    desc: "One of the world's finest stargazing locations. Expert guides and professional telescopes provided.",
    gradient: "linear-gradient(135deg, #053f5c, #429ebd)",
    href: "https://gyg.me/Wgr2pcgZ",
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

const features = [
  "Daily Tenerife weather forecasts",
  "Travel guides and local information",
  "Airport and transport updates",
  "Excursions and things to do",
  "Community of 6,000+ Tenerife enthusiasts on Facebook",
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function PreviewHomePage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden px-6"
        style={{
          minHeight: "92vh",
          paddingTop: "clamp(140px, 18vw, 200px)",
          paddingBottom: "80px",
          background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)",
        }}
      >
        {/* Floating blobs — matches site homepage */}
        <div
          className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-2xl rounded-full opacity-25 animate-float"
          style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[5%] right-[-8%] w-[45vw] h-[45vw] max-w-xl rounded-full opacity-20"
          style={{ background: "#053f5c", filter: "blur(80px)", animation: "float 12s ease-in-out 3s infinite" }}
          aria-hidden="true"
        />
        <div
          className="absolute top-[40%] right-[15%] w-[30vw] h-[30vw] max-w-lg rounded-full opacity-15"
          style={{ background: "var(--color-sun)", filter: "blur(70px)", animation: "float 14s ease-in-out 6s infinite" }}
          aria-hidden="true"
        />

        {/* Live indicator */}
        <div
          className="relative z-10 inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ background: "white", color: "var(--color-deep)", boxShadow: "0 2px 12px rgba(5,63,92,0.15)" }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live — Updated daily
        </div>

        {/* Headline */}
        <h1
          className="relative z-10 font-bold text-white leading-none tracking-tight mb-5"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            maxWidth: "820px",
            textShadow: "0 2px 16px rgba(5,63,92,0.3)",
          }}
        >
          Tenerife{" "}
          <span style={{ color: "var(--color-sun)" }}>Weather</span>{" "}
          Forum
        </h1>

        {/* Description */}
        <p
          className="relative z-10 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          An independent Tenerife weather and travel community providing daily forecasts,
          travel guides, local information, airport updates and holiday advice for visitors and residents.
        </p>

        {/* Feature list */}
        <ul className="relative z-10 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mb-10 text-left max-w-2xl w-full">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: "rgba(255,255,255,0.85)" }}>
              <span
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--color-sun)", color: "var(--color-deep)" }}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
          <Link href="/weather" className="btn-primary text-sm sm:text-base px-7 py-3.5 justify-center">
            Today&apos;s Forecast <ArrowRight size={16} />
          </Link>
          <a
            href="https://www.facebook.com/groups/1826293804889186"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm sm:text-base px-7 py-3.5 justify-center"
          >
            Join Facebook Group
          </a>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: "block" }}>
            <path d="M0 80 C360 20 1080 20 1440 80 L1440 80 L0 80 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ════════════════════════════════════════════════════════════════
            GUIDES
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="guides-heading">
          <div className="mb-6">
            <h2 id="guides-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
              Essential Travel Guides
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Everything you need to know before and during your Tenerife trip
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {guides.map((g) => (
              <Link
                key={g.label}
                href={g.href}
                className="group rounded-2xl sm:rounded-3xl overflow-hidden card-hover"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 2px 12px rgba(5,63,92,0.06)",
                }}
              >
                {/* Coloured accent bar at top */}
                <div className="h-1.5 w-full" style={{ background: g.gradient }} />
                <div className="p-4 sm:p-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white"
                    style={{ background: g.gradient }}
                  >
                    {g.icon}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: "var(--color-deep)" }}>
                    {g.label}
                  </h3>
                  <p className="text-xs leading-relaxed hidden sm:block mb-3" style={{ color: "var(--color-text-muted)" }}>
                    {g.desc}
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-mid)" }}>
                    Read guide <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            EXCURSIONS
        ════════════════════════════════════════════════════════════════ */}
        <section className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="excursions-heading">
          <div className="mb-6">
            <h2 id="excursions-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
              Excursions &amp; Activities
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Hand-picked experiences for every type of visitor
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {excursions.map((ex) => (
              <div
                key={ex.title}
                className="card card-hover overflow-hidden"
                style={{ borderRadius: "1.5rem" }}
              >
                {/* Gradient image placeholder */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ height: 140, background: ex.gradient }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white glass"
                  >
                    {ex.icon}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1.5" style={{ color: "var(--color-deep)" }}>
                    {ex.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
                    {ex.desc}
                  </p>
                  <a
                    href={ex.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs px-5 py-2.5 inline-flex"
                    style={{ width: "fit-content" }}
                  >
                    Book Activity
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            WEBCAMS
        ════════════════════════════════════════════════════════════════ */}
        <section className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="webcams-heading">
          <div className="mb-6">
            <h2 id="webcams-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
              Live Webcams
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              See what the weather looks like right now across the island
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {webcams.map((cam) => (
              <div key={cam.label} className="card card-hover overflow-hidden" style={{ borderRadius: "1.5rem" }}>
                {/* Dark video placeholder */}
                <div
                  className="relative flex flex-col items-center justify-center gap-3"
                  style={{ aspectRatio: "16/9", background: "linear-gradient(145deg, #053f5c, #1a6080)" }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)",
                    }}
                  />
                  <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <Camera size={22} />
                  </div>
                  <div className="text-center z-10">
                    <p className="text-white font-semibold text-sm">{cam.label}</p>
                    <p className="text-xs mt-0.5 text-white/45">{cam.sublabel}</p>
                  </div>
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    Coming soon
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} style={{ color: "var(--color-mid)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--color-deep)" }}>{cam.label}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{cam.sublabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            NEWSLETTER
        ════════════════════════════════════════════════════════════════ */}
        <section className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="subscribe-heading">
          <div className="rounded-3xl overflow-hidden" style={{ background: "var(--gradient-ocean)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="px-8 sm:px-10 py-10 sm:py-12 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Free newsletter
                </p>
                <h2 id="subscribe-heading" className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Tenerife weather, straight to your inbox
                </h2>
                <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6">
                  Join thousands of visitors and residents who get their daily Tenerife weather forecast and monthly travel guide delivered straight to their inbox — completely free.
                </p>
                <div className="flex flex-col gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <span>🌅</span>
                    <span><strong className="text-white">Daily digest</strong> — conditions sent every morning at 7am</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span><strong className="text-white">Monthly newsletter</strong> — climate, events and travel tips</span>
                  </div>
                </div>
              </div>
              <div
                className="px-8 sm:px-10 py-10 sm:py-12"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
              >
                <SubscribeForm compact onDark />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Preview watermark */}
      <div
        className="py-4 text-center text-xs"
        style={{ background: "var(--color-deep)", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}
      >
        PREVIEW PAGE — not linked from the live site · /preview/home
      </div>
    </div>
  );
}
