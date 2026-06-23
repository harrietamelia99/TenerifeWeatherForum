import type { Metadata } from "next";
import Link from "next/link";
import { Camera, ArrowRight, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Webcams | Tenerife Weather Forum",
  description: "Live webcam feeds from beaches and resorts across Tenerife — Costa Adeje, Los Cristianos, Puerto de la Cruz, Los Gigantes and more.",
};

const webcams = [
  {
    label: "Playa de Fañabé",
    sublabel: "Costa Adeje",
    photogramId: 383,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-de-fanabe.html",
    description: "One of Costa Adeje's most popular beaches, sheltered and sandy with clear blue water. Great for checking wave conditions before heading out.",
  },
  {
    label: "Playa del Duque",
    sublabel: "Costa Adeje",
    photogramId: 1073,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-del-duque.html",
    description: "The flagship beach of Costa Adeje's luxury hotel strip — wide, clean, and usually calm. Popular with families and sunbathers year-round.",
  },
  {
    label: "Los Cristianos",
    sublabel: "Tenerife South",
    photogramId: 340,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-los-cristianos.html",
    description: "The busy harbour beach of Los Cristianos, one of the oldest resort towns in the south. Check the harbour conditions and beach before visiting.",
  },
  {
    label: "Puerto de la Cruz",
    sublabel: "Tenerife North",
    photogramId: 1043,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/tenerife-puerto-de-la-cruz.html",
    description: "Tenerife's northern capital and one of the oldest tourist towns on the island. The north has a different microclimate — often cloudier but lush and green.",
  },
  {
    label: "Los Gigantes",
    sublabel: "West Tenerife",
    photogramId: 715,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/los-gigantes.html",
    description: "The dramatic cliffs of Los Gigantes tower 600 metres above the Atlantic. The calm marina here is the departure point for many whale watching and boat trips.",
  },
  {
    label: "Las Vistas Beach",
    sublabel: "Los Cristianos",
    photogramId: 339,
    href: "https://www.skylinewebcams.com/en/webcam/espana/canarias/santa-cruz-de-tenerife/playa-las-vistas.html",
    description: "A long, wide beach of golden sand at the edge of Los Cristianos, protected by a natural breakwater. One of the most sheltered beaches in the south.",
  },
];

export default function WebcamsPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>

      {/* Header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-12 sm:pb-16 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)" }}
      >
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20" style={{ background: "var(--color-sky)", filter: "blur(80px)" }} aria-hidden="true" />
        <div className="absolute -right-10 bottom-0 w-60 h-60 rounded-full opacity-15" style={{ background: "var(--color-sun)", filter: "blur(60px)" }} aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-5 hover:text-white transition-colors">
            <ArrowRight size={13} className="rotate-180" /> Home
          </Link>
          <span className="tag-pill mb-4 inline-block">Live Cameras</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Tenerife Live Webcams
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            See current conditions at beaches and resorts across the island. Images update every 5 minutes from SkylineWebcams — click any camera to watch the live stream.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <RefreshCw size={11} />
            Images refresh every 5 minutes
          </div>
        </div>
      </div>

      {/* Webcam grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {webcams.map((cam) => (
            <div key={cam.label} className="flex flex-col">
              {/* Camera tile */}
              <a
                href={cam.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover overflow-hidden block group"
                style={{ borderRadius: "1.5rem" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://embed.skylinewebcams.com/img/${cam.photogramId}.jpg`}
                    alt={`Live webcam — ${cam.label}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(5,63,92,0.85) 0%, rgba(5,63,92,0.2) 55%, transparent 100%)" }}
                  />
                  {/* Live badge */}
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </div>
                  {/* Labels and CTA */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-base leading-tight mb-0.5">{cam.label}</p>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>{cam.sublabel}</p>
                    <span className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 pointer-events-none">
                      <Camera size={12} />
                      Watch Live
                    </span>
                  </div>
                </div>
              </a>

              {/* Description below */}
              <p className="text-sm leading-relaxed mt-3 px-1" style={{ color: "var(--color-text-muted)" }}>
                {cam.description}
              </p>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div
          className="mt-12 rounded-2xl p-5 flex items-start gap-3"
          style={{ background: "rgba(159,231,245,0.1)", border: "1px solid rgba(66,158,189,0.2)" }}
        >
          <RefreshCw size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-mid)" }} />
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--color-deep)" }}>About these webcams</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              These are official photogram embeds from <a href="https://www.skylinewebcams.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">SkylineWebcams</a>, updating every 5 minutes. Click any camera tile to watch the continuous live stream on SkylineWebcams. For live weather conditions across the island, check the <Link href="/weather" className="underline hover:opacity-80">weather page</Link>.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-10 rounded-3xl p-8 sm:p-12 text-center"
          style={{ background: "var(--gradient-ocean)" }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Check the full forecast</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm">
            Webcams show you what it looks like right now — the weather page gives you conditions, temperatures and the 7-day outlook.
          </p>
          <Link href="/weather" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
            Today&apos;s Forecast <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
