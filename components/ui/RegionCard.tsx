import WeatherIcon from "./WeatherIcon";
import type { RegionData } from "@/types/weather";

interface RegionCardProps {
  region: RegionData;
  className?: string;
  compact?: boolean;
}

export default function RegionCard({ region, className = "", compact = false }: RegionCardProps) {
  return (
    <div
      className={`rounded-3xl overflow-hidden card-hover relative flex flex-col ${className}`}
      style={{
        background: region.gradient,
        boxShadow: "0 4px 20px rgba(5,63,92,0.12)",
      }}
    >
      <div className="p-4 sm:p-6">
        {/* Icon and region name */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-white/60 mb-1 hidden sm:block">
              {region.slug}
            </p>
            <h3 className="font-700 text-base sm:text-xl text-white leading-tight">{region.region}</h3>
          </div>
          <WeatherIcon
            condition={region.condition}
            size={compact ? 40 : 56}
            className="!bg-white/20 !shadow-none"
          />
        </div>

        {/* Temperature */}
        <div className="flex items-end gap-1 mb-2">
          <span
            className="tabular-nums font-700 text-white leading-none"
            style={{ fontSize: compact ? "2rem" : "3.5rem", letterSpacing: "-1px" }}
          >
            {region.temp}
          </span>
          <span className="text-base font-300 text-white/70 mb-0.5">°C</span>
        </div>

        {/* Condition */}
        <p className="text-xs sm:text-sm font-500 text-white/80 mb-2 uppercase tracking-wide">
          {conditionLabel(region.condition)}
        </p>

        {!compact && (
          <>
            <p className="text-sm text-white/65 leading-relaxed mb-4">{region.description}</p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Best: {region.bestTime}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function conditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    sunny: "Sunny",
    "partly-cloudy": "Partly Cloudy",
    cloudy: "Cloudy",
    rain: "Rain",
    showers: "Showers",
    thunderstorm: "Thunderstorm",
    windy: "Windy",
    fog: "Foggy",
    clear: "Clear",
  };
  return labels[condition] ?? condition;
}
