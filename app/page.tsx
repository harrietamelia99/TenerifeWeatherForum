import Link from "next/link";
import SubscribeForm from "@/components/ui/SubscribeForm";
import {
  Camera,
  ArrowRight,
  Calendar,
  Luggage,
  CloudSun,
  Map,
} from "lucide-react";

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
    title: "Siam Park",
    desc: "Asia-inspired water park voted world's best. Slides, wave pools and lazy rivers for all ages.",
    img: "/images/excursion-siam-park.png",
    href: "https://gyg.me/DaRn8YVu",
  },
  {
    title: "Whale & Dolphin Watching",
    desc: "Year-round sightings of pilot whales and bottlenose dolphins off the southwest coast.",
    img: "/images/excursion-whale-watching.png",
    href: "https://gyg.me/zPK1aMuo",
  },
  {
    title: "Mount Teide Tour",
    desc: "Cable car to Spain's highest peak at 3,718m with breathtaking views across the Canary Islands.",
    img: "/images/excursion-teide-tour.png",
    href: "https://gyg.me/IXLcOg8V",
  },
  {
    title: "Jeep Safari Adventure",
    desc: "Off-road through volcanic landscapes, banana plantations and hidden valleys.",
    img: "/images/excursion-jeep-safari.png",
    href: "https://gyg.me/UFq9ct9V",
  },
  {
    title: "Sunset Boat Trip",
    desc: "Sail along the south coast as the sun sets over the Atlantic. Cocktails and sea views included.",
    img: "/images/excursion-sunset-boat.png",
    href: "https://gyg.me/CvkPIN9C",
  },
  {
    title: "Stargazing at Teide",
    desc: "One of the world's finest stargazing locations. Expert guides and professional telescopes provided.",
    img: "/images/excursion-stargazing.png",
    href: "https://gyg.me/Wgr2pcgZ",
  },
];

const webcams = [
  {
    label: "Playa de Fañabé",
    sublabel: "Costa Adeje",
    photogramId: 383,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-de-fanabe.html",
  },
  {
    label: "Playa del Duque",
    sublabel: "Costa Adeje",
    photogramId: 1073,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-del-duque.html",
  },
  {
    label: "Los Cristianos",
    sublabel: "Tenerife South",
    photogramId: 340,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-los-cristianos.html",
  },
  {
    label: "Puerto de la Cruz",
    sublabel: "Tenerife North",
    photogramId: 1043,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/tenerife-puerto-de-la-cruz.html",
  },
  {
    label: "Los Gigantes",
    sublabel: "West Tenerife",
    photogramId: 715,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/los-gigantes.html",
  },
  {
    label: "Las Vistas Beach",
    sublabel: "Los Cristianos",
    photogramId: 339,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-las-vistas.html",
  },
];

const features: { label: string; href: string; external?: boolean }[] = [
  { label: "Daily Tenerife weather forecasts",                        href: "/weather" },
  { label: "Travel guides and local information",                     href: "#section-guides" },
  { label: "Airport and transport updates",                           href: "/resources" },
  { label: "Excursions and things to do",                             href: "/excursions" },
  { label: "Live webcams",                                            href: "/webcams" },
  { label: "Trusted by over 37,000 people across our social media channels", href: "https://www.facebook.com/groups/1826293804889186", external: true },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
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
        aria-labelledby="hero-heading"
      >
        {/* Floating blobs */}
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
          id="hero-heading"
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

        {/* Feature list — styled as clickable pill buttons */}
        <ul className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-10 w-full max-w-xl">
          {features.map((f, i) => (
            <li key={f.label} className={i === features.length - 1 ? "sm:col-span-2 flex justify-center" : ""}>
              <a
                href={f.href}
                {...(f.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 text-white no-underline bg-white/15 border border-white/30 hover:bg-white/25 hover:border-white/50 backdrop-blur-sm w-full justify-center sm:justify-start"
              >
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--color-sun)", color: "var(--color-deep)" }}
                >
                  ✓
                </span>
                {f.label}
                <ArrowRight size={13} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </a>
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
        <section id="section-guides" className="py-10 sm:py-14 lg:py-16" aria-labelledby="guides-heading">
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
            EXCURSIONS TEASER
        ════════════════════════════════════════════════════════════════ */}
        <section id="section-excursions" className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="excursions-heading">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 id="excursions-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
                Excursions &amp; Activities
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Hand-picked experiences for every type of visitor
              </p>
            </div>
            <Link
              href="/excursions"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--color-mid)" }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {excursions.slice(0, 3).map((ex) => (
              <Link
                key={ex.title}
                href="/excursions"
                className="card card-hover overflow-hidden block group"
                style={{ borderRadius: "1.5rem", textDecoration: "none" }}
              >
                <div className="relative overflow-hidden" style={{ height: 160 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.img}
                    alt={ex.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(5,63,92,0.4) 0%, transparent 60%)" }} />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm" style={{ color: "var(--color-deep)" }}>{ex.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{ex.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link href="/excursions" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              See All 6 Excursions <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            WEBCAMS TEASER
        ════════════════════════════════════════════════════════════════ */}
        <section id="section-webcams" className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="webcams-heading">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 id="webcams-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
                Live Webcams
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                See what the weather looks like right now across the island
              </p>
            </div>
            <Link
              href="/webcams"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--color-mid)" }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {webcams.slice(0, 3).map((cam) => (
              <Link
                key={cam.label}
                href="/webcams"
                className="card card-hover overflow-hidden block group"
                style={{ borderRadius: "1.5rem", textDecoration: "none" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://embed.skylinewebcams.com/img/${cam.photogramId}.jpg`}
                    alt={`Live webcam — ${cam.label}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,63,92,0.88) 0%, rgba(5,63,92,0.3) 55%, transparent 100%)" }} />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{cam.label}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{cam.sublabel}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link href="/webcams" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Camera size={14} /> View All 6 Webcams
            </Link>
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
    </div>
  );
}
