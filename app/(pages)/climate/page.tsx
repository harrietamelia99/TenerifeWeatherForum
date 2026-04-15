import RegionCard from "@/components/ui/RegionCard";
import { regions } from "@/components/ui/MicroclimateStrip";
import type { ClimateMonth } from "@/types/weather";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Climate Guide",
  description: "Complete month-by-month climate guide for Tenerife. Average temperatures, sunshine hours, rainfall and sea temperatures for all 12 months.",
};

const climateData: ClimateMonth[] = [
  { month: "January",   avgHigh: 20, avgLow: 14, sunshineHours: 6,  rainfallMm: 35, seaTemp: 19 },
  { month: "February",  avgHigh: 21, avgLow: 14, sunshineHours: 7,  rainfallMm: 30, seaTemp: 18 },
  { month: "March",     avgHigh: 22, avgLow: 15, sunshineHours: 7,  rainfallMm: 25, seaTemp: 18 },
  { month: "April",     avgHigh: 23, avgLow: 16, sunshineHours: 8,  rainfallMm: 15, seaTemp: 19 },
  { month: "May",       avgHigh: 25, avgLow: 18, sunshineHours: 9,  rainfallMm: 5,  seaTemp: 20 },
  { month: "June",      avgHigh: 27, avgLow: 20, sunshineHours: 10, rainfallMm: 2,  seaTemp: 21 },
  { month: "July",      avgHigh: 30, avgLow: 22, sunshineHours: 11, rainfallMm: 0,  seaTemp: 23 },
  { month: "August",    avgHigh: 31, avgLow: 23, sunshineHours: 11, rainfallMm: 1,  seaTemp: 24 },
  { month: "September", avgHigh: 29, avgLow: 22, sunshineHours: 9,  rainfallMm: 8,  seaTemp: 24 },
  { month: "October",   avgHigh: 27, avgLow: 20, sunshineHours: 7,  rainfallMm: 25, seaTemp: 23 },
  { month: "November",  avgHigh: 24, avgLow: 17, sunshineHours: 6,  rainfallMm: 45, seaTemp: 21 },
  { month: "December",  avgHigh: 21, avgLow: 15, sunshineHours: 5,  rainfallMm: 50, seaTemp: 20 },
];

function getRatingColor(value: number, type: "sun" | "rain" | "heat"): string {
  if (type === "sun") {
    if (value >= 10) return "#f7ad19";
    if (value >= 7) return "#429ebd";
    return "#c8eef7";
  }
  if (type === "rain") {
    if (value <= 5) return "#9fe7f5";
    if (value <= 25) return "#429ebd";
    return "#053f5c";
  }
  if (type === "heat") {
    if (value >= 29) return "#f7ad19";
    if (value >= 24) return "#429ebd";
    return "#9fe7f5";
  }
  return "#429ebd";
}

export default function ClimatePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Page header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-8 sm:pb-12 relative overflow-hidden"
        style={{ background: "var(--gradient-full)" }}
      >
        <div
          className="absolute -right-20 top-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Climate Guide</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">
            Tenerife Climate Guide
          </h1>
          <p className="text-white/65 text-lg max-w-2xl">
            Month-by-month conditions, sunshine hours, sea temperatures and microclimate breakdowns for the whole island.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <div
          className="rounded-3xl p-8 mb-12"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 2px 16px rgba(5,63,92,0.06)",
          }}
        >
          <h2 className="font-700 text-xl mb-4" style={{ color: "var(--color-deep)" }}>
            Understanding Tenerife&apos;s Climate
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
            Tenerife enjoys one of the most remarkable climates in the world - nicknamed the &ldquo;Island of Eternal Spring&rdquo; for good reason. The island sits at 28° North latitude, just 300km from the coast of West Africa, and benefits from the cooling influence of the Atlantic Ocean and the Northeast Trade Winds.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            However, Tenerife&apos;s complex terrain - from sea-level resort beaches to the 3,715m summit of Mount Teide - creates dramatically different microclimates across the island. The south enjoys 320+ days of sunshine per year, while the north is noticeably greener, cooler and cloudier thanks to the trade wind cloud layer.
          </p>
        </div>

        {/* Climate table */}
        <section className="mb-16" aria-labelledby="climate-table-heading">
          <h2
            id="climate-table-heading"
            className="text-2xl font-700 mb-6"
            style={{ color: "var(--color-deep)" }}
          >
            Monthly Climate Data - South Tenerife
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            Data represents typical conditions in Playa de las Américas / Los Cristianos area.
          </p>

          {/* Desktop table */}
          <div
            className="rounded-3xl overflow-hidden hidden md:block"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 2px 16px rgba(5,63,92,0.06)",
            }}
          >
            <table className="w-full" role="table" aria-label="Monthly climate data for South Tenerife">
              <thead>
                <tr style={{ background: "var(--color-deep)" }}>
                  {["Month", "Avg High", "Avg Low", "Sunshine Hrs", "Rainfall", "Sea Temp"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-700 uppercase tracking-widest text-white/70"
                      scope="col"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {climateData.map((row, i) => (
                  <tr
                    key={row.month}
                    className="transition-colors duration-150 hover:bg-[#f0fbfe]"
                    style={{
                      borderBottom: i < climateData.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <td className="px-6 py-4 font-600 text-sm" style={{ color: "var(--color-deep)" }}>
                      {row.month}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="tabular-nums font-700 text-base px-3 py-1 rounded-full"
                        style={{
                          color: "white",
                          background: getRatingColor(row.avgHigh, "heat"),
                        }}
                      >
                        {row.avgHigh}°C
                      </span>
                    </td>
                    <td className="px-6 py-4 tabular-nums font-500 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {row.avgLow}°C
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(row.sunshineHours / 11) * 80}px`,
                            background: getRatingColor(row.sunshineHours, "sun"),
                          }}
                          aria-hidden="true"
                        />
                        <span className="tabular-nums text-sm font-500" style={{ color: "var(--color-deep)" }}>
                          {row.sunshineHours}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.max(4, (row.rainfallMm / 50) * 80)}px`,
                            background: getRatingColor(row.rainfallMm, "rain"),
                          }}
                          aria-hidden="true"
                        />
                        <span className="tabular-nums text-sm font-500" style={{ color: "var(--color-text-muted)" }}>
                          {row.rainfallMm}mm
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 tabular-nums font-600 text-sm" style={{ color: "var(--color-mid)" }}>
                      {row.seaTemp}°C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {climateData.map((row) => (
              <div
                key={row.month}
                className="rounded-3xl p-5"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 className="font-700 text-base mb-4" style={{ color: "var(--color-deep)" }}>
                  {row.month}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-[--color-text-muted] mb-0.5">High / Low</p>
                    <p className="tabular-nums font-700" style={{ color: "var(--color-sun)" }}>
                      {row.avgHigh}° <span className="font-400 text-[--color-text-muted]">/ {row.avgLow}°</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[--color-text-muted] mb-0.5">Sunshine</p>
                    <p className="tabular-nums font-700" style={{ color: "var(--color-deep)" }}>{row.sunshineHours}h/day</p>
                  </div>
                  <div>
                    <p className="text-xs text-[--color-text-muted] mb-0.5">Rainfall</p>
                    <p className="tabular-nums font-700" style={{ color: "var(--color-mid)" }}>{row.rainfallMm}mm</p>
                  </div>
                  <div>
                    <p className="text-xs text-[--color-text-muted] mb-0.5">Sea Temp</p>
                    <p className="tabular-nums font-700" style={{ color: "var(--color-mid)" }}>{row.seaTemp}°C</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Microclimate regions */}
        <section className="mb-16" aria-labelledby="regions-heading">
          <h2
            id="regions-heading"
            className="text-2xl font-700 mb-3"
            style={{ color: "var(--color-deep)" }}
          >
            Microclimates by Region
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            Tenerife&apos;s four main climate zones - each with distinct characteristics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region) => (
              <RegionCard key={region.region} region={region} />
            ))}
          </div>
        </section>

        {/* Altitude section */}
        <section
          className="rounded-3xl overflow-hidden"
          style={{ background: "var(--gradient-ocean)" }}
          aria-labelledby="altitude-heading"
        >
          <div className="p-8 md:p-10 relative">
            <div
              className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20"
              style={{ background: "var(--color-sky)", filter: "blur(60px)" }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <span className="tag-pill mb-4 inline-block">Altitude Effects</span>
              <h2
                id="altitude-heading"
                className="text-2xl font-700 text-white mb-4"
              >
                How Altitude Changes Everything
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    altitude: "0 – 400m",
                    zones: "Coastal Resorts",
                    temp: "18–30°C",
                    desc: "The resort belt - warm, dry and sunny year-round in the south. Trade-wind influence in the north creates more cloud and humidity.",
                  },
                  {
                    altitude: "400 – 1,800m",
                    zones: "Cloud Layer",
                    temp: "12–20°C",
                    desc: "The trade wind cloud forms here, creating the lush laurel forests of Anaga and the Orotava Valley. Misty, cool and strikingly beautiful.",
                  },
                  {
                    altitude: "1,800m+",
                    zones: "Above the Clouds",
                    temp: "-5–15°C",
                    desc: "Teide National Park sits above the cloud layer in permanent clear sky. Temperatures drop dramatically - snow possible on the summit October–May.",
                  },
                ].map((zone) => (
                  <div
                    key={zone.altitude}
                    className="rounded-2xl p-5"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <p className="text-xs font-700 uppercase tracking-widest text-white/50 mb-2">
                      {zone.altitude}
                    </p>
                    <h3 className="font-700 text-white text-lg mb-1">{zone.zones}</h3>
                    <p
                      className="tabular-nums font-700 text-2xl mb-3"
                      style={{ color: "var(--color-sun)" }}
                    >
                      {zone.temp}
                    </p>
                    <p className="text-sm text-white/65 leading-relaxed">{zone.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
