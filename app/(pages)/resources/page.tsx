import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Plane, Bus, Cloud, Luggage, Info, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Useful Resources",
  description: "Everything you need to plan your trip to Tenerife - transport, weather tools, official information and local guides.",
};

interface ResourceLinkProps {
  href: string;
  label: string;
  description?: string;
  isInternal?: boolean;
}

function ResourceLink({ href, label, description, isInternal = false }: ResourceLinkProps) {
  if (isInternal) {
    return (
      <Link
        href={href}
        className="flex items-start gap-3 p-4 rounded-3xl transition-all duration-200 group card-hover"
        style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
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
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 rounded-3xl transition-all duration-200 group card-hover"
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
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
    </a>
  );
}

function ComingSoonPlaceholder({ message = "Affiliate partners being set up — check back soon." }: { message?: string }) {
  return (
    <div
      className="flex items-center gap-3 p-5 rounded-3xl"
      style={{
        background: "rgba(5,63,92,0.04)",
        border: "1px dashed var(--color-border)",
      }}
    >
      <Clock size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
      <div>
        <p className="text-sm font-600 mb-0.5" style={{ color: "var(--color-deep)" }}>Coming Soon</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{message}</p>
      </div>
    </div>
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
            Curated links, tools and guides to help you plan your Tenerife trip.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── TRANSPORT ─────────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Bus size={24} />}
            title="Getting Around Tenerife"
            description="Public buses, taxis and local transport options across the island."
            gradient="linear-gradient(135deg, #429ebd, #053f5c)"
          >
            <ResourceLink
              href="https://www.titsa.com"
              label="TITSA - Official Bus Network"
              description="Tenerife's public bus service. Route maps, live timetables and BONO card information"
            />
            <ResourceLink
              href="https://www.titsa.com/index.php/en/lines-and-timetables"
              label="TITSA Route Finder & Timetables"
              description="Search for bus routes between resorts, towns and both airports"
            />
            <ResourceLink
              href="https://www.tenerifetransporte.com"
              label="Tenerife Transport Guide"
              description="Practical guide to buses, taxis and transfers for tourists"
            />
            <ResourceLink
              href="/blog/getting-around-tenerife"
              label="Our Transport Guide (Blog)"
              description="Tips on buses, taxis and getting around from our team"
              isInternal
            />
          </ResourceSection>

          {/* ── BOOKING & FLIGHTS ─────────────────────────────────────────── */}
          <ResourceSection
            icon={<Plane size={24} />}
            title="Booking & Flights"
            description="Find flights and accommodation to Tenerife South (TFS) and Tenerife North (TFN)."
            gradient="linear-gradient(135deg, #f7ad19, #429ebd)"
          >
            <ComingSoonPlaceholder message="We're setting up travel partners — recommended booking links coming soon." />
          </ResourceSection>

          {/* ── WEATHER TOOLS ─────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Cloud size={24} />}
            title="Weather Tools"
            description="External weather resources for detailed forecasts, marine conditions and Teide summit data."
            gradient="linear-gradient(135deg, #9fe7f5, #429ebd)"
          >
            <ResourceLink
              href="https://www.aemet.es/en/portada"
              label="AEMET - Spanish Met Office"
              description="Official Spanish meteorological agency. Most accurate for severe weather warnings"
            />
            <ResourceLink
              href="https://www.windfinder.com/#8/28.1/-16.6"
              label="Windfinder - Wind & Sea Conditions"
              description="Essential for kitesurfers, windsurfers and sailors at El Médano and Los Gigantes"
            />
            <ResourceLink
              href="https://www.meteoblue.com/en/weather/week/tenerife_spain_2510574"
              label="Meteoblue - Mountain Forecasts"
              description="Best resource for Teide summit conditions and altitude weather"
            />
            <ResourceLink
              href="https://open-meteo.com"
              label="Open-Meteo - Weather API"
              description="The free weather data source powering this site's live forecasts"
            />
          </ResourceSection>

          {/* ── PACKING & GEAR ────────────────────────────────────────────── */}
          <ResourceSection
            icon={<Luggage size={24} />}
            title="Packing Advice"
            description="What to bring for Tenerife, whatever the season or activity."
            gradient="linear-gradient(135deg, #f7ad19, #053f5c)"
          >
            <ResourceLink
              href="/blog/packing-guide-tenerife"
              label="Tenerife Packing Guide (Blog)"
              description="Our comprehensive guide covering every season and activity"
              isInternal
            />
            <ComingSoonPlaceholder message="Gear recommendations and product links coming soon." />
          </ResourceSection>

          {/* ── OFFICIAL TOURIST INFO ─────────────────────────────────────── */}
          <ResourceSection
            icon={<Info size={24} />}
            title="Official Tourist Info"
            description="Official tourism boards, entry requirements and local government resources."
            gradient="linear-gradient(135deg, #429ebd, #9fe7f5)"
          >
            <ResourceLink
              href="https://www.webtenerife.com/tenerife/"
              label="Tenerife Tourism - Official Site"
              description="The official Tenerife tourism board — events, attractions and travel info"
            />
            <ResourceLink
              href="https://www.gov.uk/foreign-travel-advice/spain"
              label="UK Foreign Travel Advice - Spain"
              description="UK Government travel guidance for British passport holders visiting Tenerife"
            />
            <ResourceLink
              href="https://www.miteco.gob.es/en/parques-nacionales-oapn/red-parques-nacionales/teide/"
              label="Teide National Park - Official Site"
              description="Permits, opening times and trail maps for Teide National Park"
            />
            <ResourceLink
              href="https://www.gobiernodecanarias.org/inicio/"
              label="Government of the Canary Islands"
              description="Official government site — regulations and public services"
            />
          </ResourceSection>

          {/* ── LOCAL ESSENTIALS ──────────────────────────────────────────── */}
          <ResourceSection
            icon={<Info size={24} />}
            title="Local Essentials"
            description="Useful contact numbers and practical information for your time in Tenerife."
            gradient="linear-gradient(135deg, #053f5c, #9fe7f5)"
          >
            <ResourceLink
              href="https://www.nhsinform.scot/illnesses-and-conditions/skin-hair-and-nails/sunburn"
              label="Emergency Numbers in Spain"
              description="112 (general emergency) · 061 (medical) · 091 (police) · 080 (fire)"
            />
            <ResourceLink
              href="https://www.ehic.org.uk"
              label="EHIC / GHIC Health Card"
              description="Apply for or renew your Global Health Insurance Card before travelling"
            />
            <ResourceLink
              href="https://www.aena.es/en/tenerife-south-airport.html"
              label="Tenerife South Airport (TFS) - AENA"
              description="Arrivals, departures and airport information for Tenerife South"
            />
            <ResourceLink
              href="https://www.aena.es/en/tenerife-north-airport.html"
              label="Tenerife North Airport (TFN) - AENA"
              description="Arrivals, departures and airport information for Tenerife North"
            />
          </ResourceSection>

        </div>

      </div>
    </div>
  );
}
