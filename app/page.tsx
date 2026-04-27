export const dynamic = "force-dynamic";

import Link from "next/link";
import WeatherCard from "@/components/ui/WeatherCard";
import MicroclimateStrip from "@/components/ui/MicroclimateStrip";
import BlogCard from "@/components/ui/BlogCard";
import NewsletterBar from "@/components/ui/NewsletterBar";
import HeroClouds from "@/components/ui/HeroClouds";
import ForecastButton from "@/components/ui/ForecastButton";
import { getAllPosts } from "@/lib/getPosts";
import { getHomepageWeather } from "@/lib/getWeather";
import { MapPin, Calendar, BookOpen, Luggage, Bus, Lightbulb } from "lucide-react";

export default async function HomePage() {
  const [allPosts, todayWeather] = await Promise.all([
    Promise.resolve(getAllPosts()),
    getHomepageWeather(),
  ]);
  const recentPosts = allPosts.slice(0, 3);

  const quickLinks = [
    { icon: <Calendar size={22} />, label: "Monthly Climate Guides", desc: "Month-by-month breakdown of what to expect", href: "/climate", gradient: "linear-gradient(135deg, #9fe7f5, #429ebd)" },
    { icon: <Luggage size={22} />,  label: "Packing Advice",          desc: "What to bring for every season",             href: "/blog",    gradient: "linear-gradient(135deg, #f7ad19, #429ebd)" },
    { icon: <Bus size={22} />,      label: "Transport Info",          desc: "Buses, taxis and car hire guides",           href: "/resources",gradient: "linear-gradient(135deg, #429ebd, #053f5c)" },
    { icon: <Lightbulb size={22} />,label: "Travel Tips",             desc: "Local knowledge from long-term residents",   href: "/blog",    gradient: "linear-gradient(135deg, #9fe7f5, #053f5c)" },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)" }}
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

        {/* Parallax clouds */}
        <HeroClouds />

        {/* ── MOBILE HERO (hidden on md+) ── */}
        <div className="md:hidden relative z-10 flex flex-col min-h-screen pt-36 pb-6 px-4">

          {/* White weather card */}
          <div
            className="rounded-3xl p-5 mb-4"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 40px rgba(5,63,92,0.15)",
            }}
          >
            {/* Location + Live badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} style={{ color: "var(--color-mid)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Playa de las Américas</p>
              </div>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "var(--color-bg)", color: "var(--color-deep)", border: "1px solid var(--color-border)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Big temperature */}
            <div className="flex items-end gap-1 mb-1">
              <span
                className="tabular-nums font-bold leading-none"
                style={{ fontSize: "clamp(80px, 24vw, 110px)", color: "var(--color-sun)", letterSpacing: "-3px" }}
              >
                26
              </span>
              <span className="text-2xl font-light mb-3" style={{ color: "var(--color-text-muted)" }}>°C</span>
            </div>

            {/* Condition + high/low */}
            <p className="font-bold text-lg mb-0.5" style={{ color: "var(--color-deep)" }}>Sunny</p>
            <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>High 27° · Low 19° · Feels like 28°</p>

            {/* Stat tiles */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: "Wind", value: "18", unit: "km/h" },
                { label: "UV", value: "7", unit: "High" },
                { label: "Humid", value: "58", unit: "%" },
                { label: "Sea", value: "20", unit: "°C" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-3 rounded-2xl"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  <span className="tabular-nums font-bold text-base leading-none" style={{ color: "var(--color-deep)" }}>{s.value}</span>
                  <span className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.unit}</span>
                  <span className="uppercase tracking-wide mt-1" style={{ color: "var(--color-text-muted)", fontSize: "0.6rem" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <ForecastButton className="btn-primary flex-1 text-center text-sm py-3" />
              <Link href="/climate" className="btn-outline flex-1 text-center text-sm py-3">
                Plan Your Trip
              </Link>
            </div>
          </div>

          {/* Beach photo card */}
          <div className="rounded-3xl overflow-hidden relative flex-1" style={{ minHeight: "160px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/playa-teresitas.png"
              alt="Playa de las Teresitas, Tenerife"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(5,63,92,0.55) 0%, transparent 55%)" }}
            />
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
              <MapPin size={12} className="text-white/80" />
              <span className="text-white/80 text-xs font-medium">Playa de las Teresitas</span>
            </div>
          </div>
        </div>

        {/* ── DESKTOP HERO (hidden below md) ── */}
        <div className="hidden md:block relative z-10 px-6 lg:px-8 pt-36 lg:pt-44 pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-8 items-stretch">

            {/* Left: heading + CTAs */}
            <div className="flex flex-col justify-center gap-5 lg:gap-6">
              <div className="inline-flex items-center">
                <span
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
                  style={{ background: "white", color: "var(--color-deep)", boxShadow: "0 2px 12px rgba(5,63,92,0.15)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live - Updated daily
                </span>
              </div>

              <h1
                id="hero-heading"
                className="text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white leading-none tracking-tight"
                style={{ textShadow: "0 2px 16px rgba(5, 63, 92, 0.3)" }}
              >
                Tenerife
                <br />
                <span style={{ color: "var(--color-sun)" }}>Weather</span>
                <br />
                Forum
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-white/75 leading-relaxed">
                Daily forecasts, microclimates and travel info - all in one place. Trusted by UK travellers and Tenerife residents.
              </p>

              <div className="flex gap-3">
                <ForecastButton className="btn-primary text-sm lg:text-base px-5 lg:px-8 py-3 lg:py-3.5" />
                <Link href="/climate" className="btn-ghost text-sm lg:text-base px-5 lg:px-8 py-3 lg:py-3.5">
                  Plan Your Trip
                </Link>
              </div>
            </div>

            {/* Right: weather card */}
            <div>
              <WeatherCard
                data={todayWeather}
                variant="light"
                image="/images/playa-teresitas.png"
                imageAlt="Playa de las Teresitas, Tenerife"
              />
              <div
                className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white",
                }}
              >
                <MapPin size={14} className="text-sky-300" />
                Sea temp: <strong className="tabular-nums" style={{ color: "var(--color-sky)" }}>20°C</strong>
                <span className="text-white/50">·</span>
                <span>Sunrise: 07:21 - Sunset: 20:44</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: "block" }}>
            <path d="M0 80 C360 20 1080 20 1440 80 L1440 80 L0 80 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <section className="py-10 sm:py-14 lg:py-16">
          <MicroclimateStrip />
        </section>

        <section className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="quicklinks-heading">
          <div className="mb-6">
            <h2 id="quicklinks-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
              Explore the Forum
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Everything you need to know about Tenerife weather and travel
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group rounded-2xl sm:rounded-3xl p-4 sm:p-6 card-hover"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 2px 12px rgba(5,63,92,0.06)" }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white" style={{ background: link.gradient }}>
                  {link.icon}
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: "var(--color-deep)" }}>{link.label}</h3>
                <p className="text-xs leading-relaxed hidden sm:block" style={{ color: "var(--color-text-muted)" }}>{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-10 sm:pb-14 lg:pb-16" aria-labelledby="blog-heading">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="blog-heading" className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-deep)" }}>
                Latest News &amp; Tips
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Fresh updates from the forum
              </p>
            </div>
            <Link href="/blog" className="btn-chip flex-shrink-0">
              <BookOpen size={14} />
              <span className="hidden sm:inline">All posts</span>
              <span className="sm:hidden">All</span>
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-12 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <p style={{ color: "var(--color-text-muted)" }}>
                No posts yet. Add markdown files to{" "}
                <code className="text-sm px-2 py-0.5 rounded" style={{ background: "var(--color-bg)" }}>/content/blog/</code>{" "}
                to get started.
              </p>
            </div>
          )}
        </section>

        {/* ── FOLLOW US ON SOCIAL ── */}
        <section className="pb-10 sm:pb-14 lg:pb-16">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: "#053f5c" }}
          >
            {/* Background photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coast-sunset.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.45 }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(5,63,92,0.7) 0%, rgba(66,158,189,0.55) 100%)" }}
              aria-hidden="true"
            />

            {/* Mountain illustration accent */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mountain-illustration.svg"
              alt=""
              aria-hidden="true"
              className="absolute pointer-events-none select-none hidden sm:block"
              style={{ bottom: "-10%", right: "3%", width: "30%", maxWidth: "340px", opacity: 0.15 }}
            />

            <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              {/* Text */}
              <div className="text-center sm:text-left flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Stay connected</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Follow us for daily updates</h2>
                <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                  Get daily weather updates, travel tips and Tenerife content on Facebook and TikTok.
                </p>
              </div>

              {/* Social cards */}
              <div className="flex gap-4 flex-shrink-0">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/groups/1826293804889186"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 px-7 py-6 rounded-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                  style={{ background: "white", boxShadow: "0 4px 20px rgba(5,63,92,0.15)" }}
                  aria-label="Follow on Facebook"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f7ad19, #ffcc55)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: "var(--color-deep)" }}>Facebook</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Join the group</p>
                  </div>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@tenerifeweatherforum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 px-7 py-6 rounded-2xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                  style={{ background: "white", boxShadow: "0 4px 20px rgba(5,63,92,0.15)" }}
                  aria-label="Follow on TikTok"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f7ad19, #ffcc55)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: "var(--color-deep)" }}>TikTok</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Watch videos</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12 sm:pb-16 lg:pb-24">
          <NewsletterBar />
        </section>
      </div>
    </>
  );
}
