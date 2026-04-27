import RegionCard from "./RegionCard";
import { getLocationWeather } from "@/lib/getWeather";
import type { RegionData, WeatherCondition } from "@/types/weather";

// Static info that doesn't change (descriptions, gradients, best times)
const REGION_META = [
  {
    region: "South Tenerife",
    slug: "Playa de las Américas",
    lat: 28.0573, lon: -16.7146,
    description: "The driest, sunniest part of the island. Sheltered from the trade winds by the central mountains. Perfect for beach holidays year-round.",
    bestTime: "Year-round",
    gradient: "linear-gradient(135deg, #f7ad19, #429ebd)",
  },
  {
    region: "North Tenerife",
    slug: "Puerto de la Cruz",
    lat: 28.4142, lon: -16.5484,
    description: "Lush and dramatic thanks to the trade winds. Morning cloud usually clears by midday. The Orotava Valley is one of Tenerife's most beautiful spots.",
    bestTime: "Spring & Autumn",
    gradient: "linear-gradient(135deg, #429ebd, #053f5c)",
  },
  {
    region: "East Tenerife",
    slug: "El Médano",
    lat: 28.0449, lon: -16.5380,
    description: "Famous for its constant wind - world-class kitesurfing and windsurfing. Santa Cruz, the capital, is also here with great shopping and dining.",
    bestTime: "Summer",
    gradient: "linear-gradient(135deg, #9fe7f5, #429ebd)",
  },
  {
    region: "West Tenerife",
    slug: "Los Gigantes",
    lat: 28.2449, lon: -16.8393,
    description: "Sheltered and warm even in winter. The dramatic Los Gigantes cliffs rise 600m from the sea. A quieter alternative to the busy south.",
    bestTime: "Winter",
    gradient: "linear-gradient(135deg, #429ebd, #9fe7f5)",
  },
];

export default async function MicroclimateStrip() {
  // Fetch live temps for all four regions in parallel
  const liveData = await Promise.all(
    REGION_META.map((r) =>
      getLocationWeather(r.lat, r.lon, r.region).catch(() => null)
    )
  );

  const regions: RegionData[] = REGION_META.map((meta, i) => ({
    region: meta.region,
    slug: meta.slug,
    condition: (liveData[i]?.condition ?? "partly-cloudy") as WeatherCondition,
    temp: liveData[i]?.tempCurrent ?? liveData[i]?.tempHigh ?? 22,
    description: meta.description,
    bestTime: meta.bestTime,
    gradient: meta.gradient,
  }));

  return (
    <section aria-labelledby="microclimate-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            id="microclimate-heading"
            className="text-2xl font-700"
            style={{ color: "var(--color-deep)" }}
          >
            Tenerife Microclimates
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Current conditions by region
          </p>
        </div>
      </div>

      {/* 2-col on mobile/tablet, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {regions.map((region) => (
          <RegionCard key={region.region} region={region} compact className="h-full" />
        ))}
      </div>
    </section>
  );
}

export { REGION_META };
