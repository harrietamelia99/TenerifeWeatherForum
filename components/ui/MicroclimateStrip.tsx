import RegionCard from "./RegionCard";
import type { RegionData } from "@/types/weather";

const regions: RegionData[] = [
  {
    region: "South Tenerife",
    slug: "Playa de las Américas",
    condition: "sunny",
    temp: 26,
    description: "The driest, sunniest part of the island. Sheltered from the trade winds by the central mountains. Perfect for beach holidays year-round.",
    bestTime: "Year-round",
    gradient: "linear-gradient(135deg, #f7ad19, #429ebd)",
  },
  {
    region: "North Tenerife",
    slug: "Puerto de la Cruz",
    condition: "partly-cloudy",
    temp: 21,
    description: "Lush and dramatic thanks to the trade winds. Morning cloud usually clears by midday. The Orotava Valley is one of Tenerife's most beautiful spots.",
    bestTime: "Spring & Autumn",
    gradient: "linear-gradient(135deg, #429ebd, #053f5c)",
  },
  {
    region: "East Tenerife",
    slug: "El Médano",
    condition: "windy",
    temp: 23,
    description: "Famous for its constant wind - world-class kitesurfing and windsurfing. Santa Cruz, the capital, is also here with great shopping and dining.",
    bestTime: "Summer",
    gradient: "linear-gradient(135deg, #9fe7f5, #429ebd)",
  },
  {
    region: "West Tenerife",
    slug: "Los Gigantes",
    condition: "sunny",
    temp: 24,
    description: "Sheltered and warm even in winter. The dramatic Los Gigantes cliffs rise 600m from the sea. A quieter alternative to the busy south.",
    bestTime: "Winter",
    gradient: "linear-gradient(135deg, #429ebd, #9fe7f5)",
  },
];

export default function MicroclimateStrip() {
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

export { regions };
