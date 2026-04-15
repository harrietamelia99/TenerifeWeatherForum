/**
 * RESOURCES PAGE - /resources
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HOW TO ADD AFFILIATE LINKS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 1. Find the resource section you want to link from (e.g. "Booking & Flights")
 * 2. Locate the <ResourceLink> component call for that item
 * 3. Update the `href` prop with your affiliate URL
 * 4. Add `isAffiliate={true}` prop - this automatically adds:
 *      rel="noopener noreferrer sponsored"
 *      (required for Google compliance on affiliate links)
 * 5. Optionally add a badge by setting `affiliateBadge="Affiliate"` prop
 *
 * Example:
 *   <ResourceLink
 *     href="https://booking.com/?aid=YOUR_AFFILIATE_ID"
 *     label="Search Hotels on Booking.com"
 *     isAffiliate={true}
 *   />
 *
 * IMPORTANT: Always disclose affiliate links clearly to users.
 * A site-wide disclosure note is included at the bottom of this page.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Plane, Bus, Cloud, Luggage, Info, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Useful Resources",
  description: "Everything you need to plan your trip to Tenerife - flights, hotels, transport, weather tools and packing guides.",
};

interface ResourceLinkProps {
  href: string;
  label: string;
  description?: string;
  isAffiliate?: boolean;
  isInternal?: boolean;
}

function ResourceLink({ href, label, description, isAffiliate = false, isInternal = false }: ResourceLinkProps) {
  const rel = isAffiliate ? "noopener noreferrer sponsored" : "noopener noreferrer";

  if (isInternal) {
    return (
      <Link
        href={href}
        className="flex items-start gap-3 p-4 rounded-3xl transition-all duration-200 group card-hover"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex-1">
          <span className="text-sm font-600 block mb-0.5" style={{ color: "var(--color-deep)" }}>
            {label}
          </span>
          {description && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {description}
            </span>
          )}
        </div>
        <ArrowRight size={14} className="mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "var(--color-mid)" }} />
        {isAffiliate && (
          <span className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0" style={{ background: "var(--color-sun)", color: "var(--color-deep)" }}>
            AD
          </span>
        )}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className="flex items-start gap-3 p-4 rounded-3xl transition-all duration-200 group card-hover"
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex-1">
        <span className="text-sm font-600 block mb-0.5" style={{ color: "var(--color-deep)" }}>
          {label}
        </span>
        {description && (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </span>
        )}
      </div>
      <ExternalLink size={14} className="mt-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-mid)" }} />
      {isAffiliate && (
        <span className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0" style={{ background: "var(--color-sun)", color: "var(--color-deep)" }}>
          AD
        </span>
      )}
    </a>
  );
}

interface ResourceSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  children: React.ReactNode;
}

function ResourceSection({ icon, title, description, gradient, children }: ResourceSectionProps) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 2px 16px rgba(5,63,92,0.06)",
      }}
    >
      {/* Section header */}
      <div className="p-6 flex items-start gap-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div>
          <h2 className="font-700 text-xl mb-1" style={{ color: "var(--color-deep)" }}>
            {title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="p-5 flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Page header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-8 sm:pb-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #053f5c, #429ebd)" }}
      >
        <div
          className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-15"
          style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">
            Useful Resources
          </h1>
          <p className="text-white/65 text-lg max-w-xl">
            Everything you need to plan your trip to Tenerife - curated links, tools and guides.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <p className="text-base mb-10" style={{ color: "var(--color-text-muted)" }}>
          We&apos;ve gathered the most useful resources for planning a Tenerife visit. Some links below may be affiliate links - marked with <strong className="font-600" style={{ color: "var(--color-deep)" }}>AD</strong>. These help support the forum at no extra cost to you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── BOOKING & FLIGHTS ─────────────────────────────────────────── */}
          <ResourceSection
            icon={<Plane size={24} />}
            title="Booking & Flights"
            description="Find the best flight and hotel deals for Tenerife. Both Tenerife South (TFS) and Tenerife North (TFN) airports are served."
            gradient="linear-gradient(135deg, #f7ad19, #429ebd)"
          >
            {/*
              ══════════════════════════════════════════════════════════════
              ADD AFFILIATE LINKS HERE - Booking & Flights
              Replace the placeholder hrefs below with your affiliate URLs.
              Add isAffiliate={true} to each link you earn commission on.
              ══════════════════════════════════════════════════════════════
            */}
            <ResourceLink
              href="https://skyscanner.net"
              label="Skyscanner - Compare Flights"
              description="Compare prices from all major airlines flying to Tenerife South and North"
              isAffiliate={false}
              // isAffiliate={true} // ← Uncomment when affiliate link is set up
            />
            <ResourceLink
              href="https://booking.com"
              label="Booking.com - Hotels & Apartments"
              description="Wide range of accommodation across all regions of Tenerife"
              isAffiliate={false}
              // isAffiliate={true} // ← Uncomment when affiliate link is set up
            />
            <ResourceLink
              href="https://airbnb.com"
              label="Airbnb - Holiday Rentals"
              description="Great for self-catering apartments and villa rentals across the island"
              isAffiliate={false}
            />
          </ResourceSection>

          {/* ── TRANSPORT ─────────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Bus size={24} />}
            title="Transport in Tenerife"
            description="Getting around Tenerife by bus, taxi or hire car. The TITSA bus network is extensive and affordable."
            gradient="linear-gradient(135deg, #429ebd, #053f5c)"
          >
            {/*
              ══════════════════════════════════════════════════════════════
              ADD AFFILIATE LINKS HERE - Transport / Car Hire
              Car hire affiliate programs: Rental Cars, Discover Cars, etc.
              ══════════════════════════════════════════════════════════════
            */}
            <ResourceLink
              href="https://titsa.com"
              label="TITSA - Official Bus Network"
              description="Tenerife's public bus service. Route maps, timetables and BONO card info"
            />
            <ResourceLink
              href="https://rentalcars.com"
              label="Rental Cars - Compare Car Hire"
              description="Compare prices from all major hire companies at TFS and TFN airports"
              isAffiliate={false}
              // isAffiliate={true} // ← Uncomment when affiliate link is set up
            />
            <ResourceLink
              href="https://discovercars.com"
              label="Discover Cars - Budget Car Hire"
              description="Often cheapest for longer rentals. Full insurance included on many deals"
              isAffiliate={false}
            />
            <ResourceLink
              href="/blog"
              label="Our Transport Guide (Blog)"
              description="Read our full guide to buses, taxis and car hire in Tenerife"
              isInternal
            />
          </ResourceSection>

          {/* ── WEATHER TOOLS ─────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Cloud size={24} />}
            title="Weather Tools"
            description="External weather resources for detailed forecasts, marine conditions and Teide summit data."
            gradient="linear-gradient(135deg, #9fe7f5, #429ebd)"
          >
            <ResourceLink
              href="https://open-meteo.com"
              label="Open-Meteo - Free Weather API"
              description="The weather data source we recommend for developers building Tenerife weather tools"
            />
            <ResourceLink
              href="https://windfinder.com"
              label="Windfinder - Wind & Sea Conditions"
              description="Essential for kitesurfers, windsurfers and sailors at El Médano and Los Gigantes"
            />
            <ResourceLink
              href="https://aemet.es"
              label="AEMET - Spanish Met Office"
              description="Official Spanish meteorological agency. Most accurate for severe weather warnings"
            />
            <ResourceLink
              href="https://meteoblue.com"
              label="Meteoblue - Mountain Forecasts"
              description="Best resource for Teide summit conditions and altitude weather"
            />
          </ResourceSection>

          {/* ── PACKING LISTS ─────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Luggage size={24} />}
            title="Packing Lists"
            description="What to pack for Tenerife - from beach days to mountain hikes - whatever month you're visiting."
            gradient="linear-gradient(135deg, #f7ad19, #053f5c)"
          >
            <ResourceLink
              href="/blog"
              label="The Ultimate Tenerife Packing List"
              description="Our comprehensive guide covering every season and activity"
              isInternal
            />
            <ResourceLink
              href="/blog"
              label="What to Pack for Winter in Tenerife"
              description="Layering guide for November–February visitors"
              isInternal
            />
            <ResourceLink
              href="/blog"
              label="Hiking Teide - Packing Checklist"
              description="Essential kit for a safe ascent of Mount Teide"
              isInternal
            />
            {/*
              ══════════════════════════════════════════════════════════════
              ADD AFFILIATE LINKS HERE - Amazon / gear recommendations
              Amazon Associates, Patagonia, Decathlon affiliate programs
              ══════════════════════════════════════════════════════════════
            */}
          </ResourceSection>

          {/* ── OFFICIAL TOURIST INFO ─────────────────────────────────────── */}
          <ResourceSection
            icon={<Info size={24} />}
            title="Official Tourist Info"
            description="Official tourism boards, entry requirements and local government resources."
            gradient="linear-gradient(135deg, #429ebd, #9fe7f5)"
          >
            <ResourceLink
              href="https://webtenerife.co.uk"
              label="Tenerife Tourism - Official Site"
              description="The official Tenerife tourism board - events, attractions and travel info"
            />
            <ResourceLink
              href="https://gobiernodecanarias.org"
              label="Government of the Canary Islands"
              description="Official government site - regulations, entry requirements, health info"
            />
            <ResourceLink
              href="https://gov.uk/foreign-travel-advice/spain"
              label="UK Foreign Travel Advice - Spain"
              description="UK Government travel guidance for UK passport holders visiting Tenerife"
            />
            <ResourceLink
              href="https://parquesnacionales.es/en/parks/teide-national-park/"
              label="Teide National Park - Official Site"
              description="Permits, opening times and trail maps for Teide National Park"
            />
          </ResourceSection>

        </div>

        {/* Affiliate disclosure */}
        <div
          className="mt-12 rounded-2xl p-5 text-sm"
          style={{
            background: "rgba(5,63,92,0.06)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
          role="note"
          aria-label="Affiliate disclosure"
        >
          <strong className="font-600" style={{ color: "var(--color-deep)" }}>Affiliate Disclosure:</strong>{" "}
          Some links on this page marked with <strong>AD</strong> are affiliate links. If you click through and make a purchase or booking, Tenerife Weather Forum may earn a small commission at no additional cost to you. This helps us keep the site free and updated daily. We only recommend services we genuinely use and trust.
        </div>

      </div>
    </div>
  );
}
