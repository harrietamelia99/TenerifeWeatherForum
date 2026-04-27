import WeatherTabsClient from "./WeatherTabsClient";
import DailyUpdate from "@/components/ui/DailyUpdate";
import {
  getLocationWeather,
  getWeeklyForecast,
  getSeaTemp,
  WEATHER_LOCATIONS,
} from "@/lib/getWeather";
import { getForecast } from "@/lib/getForecast";
import type { WeatherAlert } from "@/types/weather";

export const revalidate = 1800; // ISR: refresh every 30 minutes

export default async function WeatherPage() {
  const loc = WEATHER_LOCATIONS.playaAmericas;

  const [currentWeather, weeklyForecast, seaTemp, dailyUpdate] = await Promise.all([
    getLocationWeather(loc.lat, loc.lon, `South Tenerife — ${loc.name}`),
    getWeeklyForecast(loc.lat, loc.lon),
    getSeaTemp(loc.lat, loc.lon),
    getForecast(),
  ]);

  // Active alerts — add entries here when needed
  const alerts: WeatherAlert[] = [];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Page header */}
      <div
        className="pt-36 sm:pt-40 lg:pt-44 pb-8 sm:pb-12 relative overflow-hidden"
        style={{ background: "var(--gradient-ocean)" }}
      >
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "var(--color-sky)", filter: "blur(80px)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -right-10 bottom-0 w-60 h-60 rounded-full opacity-15"
          style={{ background: "var(--color-sun)", filter: "blur(60px)" }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="tag-pill mb-4 inline-block">Live Weather</span>
          <h1 className="text-4xl sm:text-5xl font-700 text-white mb-3">
            Weather Updates
          </h1>
          <p className="text-white/65 text-lg max-w-xl">
            Daily conditions, 7-day forecasts and weather warnings for Tenerife.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Kevin's daily update — auto-populated from his Facebook posts */}
        <div className="mb-10">
          <DailyUpdate update={dailyUpdate} />
        </div>

        {/* Live sensor data tabs */}
        <WeatherTabsClient
          currentWeather={currentWeather}
          weeklyForecast={weeklyForecast}
          alerts={alerts}
          seaTemp={seaTemp}
        />
      </div>
    </div>
  );
}
