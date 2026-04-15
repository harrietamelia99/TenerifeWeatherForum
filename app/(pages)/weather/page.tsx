/**
 * WEATHER PAGE - /weather
 *
 * This page is designed for daily updates.
 * Weather update posts should be added as markdown files in /content/blog/
 * with category: "Weather" in the frontmatter.
 *
 * For automated data, connect a weather API (e.g. Open-Meteo, Tomorrow.io)
 * in lib/getWeather.ts and replace the static data below.
 */

"use client";

import { useState } from "react";
import WeatherCard from "@/components/ui/WeatherCard";
import AlertBanner from "@/components/ui/AlertBanner";
import WeatherIcon from "@/components/ui/WeatherIcon";
import type { WeatherData, DayForecast, WeatherAlert } from "@/types/weather";
import { Clock } from "lucide-react";

// ─── Static weather data ─────────────────────────────────────────────────────
// Replace with API call when ready

const currentWeather: WeatherData = {
  location: "South Tenerife - Playa de las Américas",
  date: "Wednesday, 15 April 2026",
  condition: "sunny",
  tempHigh: 27,
  tempLow: 19,
  tempCurrent: 26,
  feelsLike: 28,
  wind: 18,
  windDirection: "NE",
  uv: 7,
  humidity: 58,
  seaTemp: 20,
  sunrise: "07:21",
  sunset: "20:44",
};

const weeklyForecast: DayForecast[] = [
  { day: "Wednesday", shortDay: "Wed", condition: "sunny", high: 27, low: 19 },
  { day: "Thursday", shortDay: "Thu", condition: "sunny", high: 28, low: 20 },
  { day: "Friday", shortDay: "Fri", condition: "partly-cloudy", high: 25, low: 18 },
  { day: "Saturday", shortDay: "Sat", condition: "partly-cloudy", high: 24, low: 18 },
  { day: "Sunday", shortDay: "Sun", condition: "sunny", high: 26, low: 19 },
  { day: "Monday", shortDay: "Mon", condition: "sunny", high: 27, low: 19 },
  { day: "Tuesday", shortDay: "Tue", condition: "partly-cloudy", high: 25, low: 17 },
];

const alerts: WeatherAlert[] = [
  // No active alerts at this time.
  // Add alerts here as needed, e.g.:
  // { id: "1", level: "amber", message: "Calima event expected Wednesday–Thursday. Hazy skies and elevated temperatures possible. Air quality may be reduced." },
];

const latestUpdates = [
  {
    time: "08:30",
    date: "15 Apr",
    title: "Clear skies across the south, cloud building in the north",
    summary: "Another beautiful morning in Playa de las Américas with temperatures already at 22°C. Puerto de la Cruz has morning cloud as expected - should clear by noon.",
  },
  {
    time: "18:00",
    date: "14 Apr",
    title: "UV reached level 8 today - high for mid-April",
    summary: "The Saharan high pressure is pushing UV levels slightly above average this week. SPF 50 essential even in the late afternoon.",
  },
  {
    time: "09:00",
    date: "14 Apr",
    title: "Weekend looks settled with temperatures rising to 28°C",
    summary: "An excellent weekend forecast for the whole island. South staying dry and sunny. North may see brief morning showers Saturday - clearing by 11am.",
  },
  {
    time: "17:30",
    date: "13 Apr",
    title: "Trade winds returning after calm spell",
    summary: "Northeasterly trades picking up this afternoon. El Médano conditions: excellent for windsurfing and kitesurfing from tomorrow.",
  },
];

const tabs = ["Today", "This Week", "Alerts"] as const;
type Tab = typeof tabs[number];

export default function WeatherPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Today");

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
        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 flex flex-col gap-3">
            {alerts.map((alert) => (
              <AlertBanner key={alert.id} level={alert.level} message={alert.message} id={alert.id} />
            ))}
          </div>
        )}

        {/* Tab nav */}
        <div
          className="flex gap-1 p-1.5 rounded-full mb-8 w-fit"
          role="tablist"
          aria-label="Weather sections"
          style={{ background: "rgba(5,63,92,0.08)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 rounded-full text-sm font-600 transition-all duration-200"
              style={
                activeTab === tab
                  ? {
                      background: "var(--color-deep)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(5,63,92,0.25)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--color-text-muted)",
                    }
              }
            >
              {tab}
              {tab === "Alerts" && alerts.length > 0 && (
                <span
                  className="ml-2 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-700"
                  style={{ background: "#dc2626", color: "white" }}
                >
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TODAY */}
        {activeTab === "Today" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main weather card - expanded */}
            <div className="lg:col-span-2">
              <WeatherCard data={currentWeather} variant="light" className="mb-6" />

              {/* Extended details */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 2px 12px rgba(5,63,92,0.06)",
                }}
              >
                <h2 className="font-700 text-lg mb-5" style={{ color: "var(--color-deep)" }}>
                  Detailed Conditions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Sea Temperature", value: "20°C", sub: "Mediterranean" },
                    { label: "Sunrise", value: "07:21", sub: "Atlantic Time" },
                    { label: "Sunset", value: "20:44", sub: "Atlantic Time" },
                    { label: "Wind Direction", value: "NE", sub: "Northeasterly" },
                    { label: "Visibility", value: "Excellent", sub: ">20 km" },
                    { label: "Pressure", value: "1018 hPa", sub: "Stable" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-4"
                      style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                    >
                      <p className="text-xs font-500 uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
                        {item.label}
                      </p>
                      <p className="tabular-nums font-700 text-lg" style={{ color: "var(--color-deep)" }}>
                        {item.value}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest updates feed */}
            <div>
              <h2 className="font-700 text-lg mb-5" style={{ color: "var(--color-deep)" }}>
                Latest Updates
              </h2>
              <div className="flex flex-col gap-4">
                {latestUpdates.map((update, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 card-hover"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 2px 12px rgba(5,63,92,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={12} style={{ color: "var(--color-text-muted)" }} />
                      <span className="text-xs font-500" style={{ color: "var(--color-text-muted)" }}>
                        {update.time} · {update.date}
                      </span>
                    </div>
                    <h3 className="font-600 text-sm mb-1.5" style={{ color: "var(--color-deep)" }}>
                      {update.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {update.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* THIS WEEK */}
        {activeTab === "This Week" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mb-8">
              {weeklyForecast.map((day, i) => (
                <div
                  key={day.day}
                  className={`rounded-3xl p-5 flex flex-col items-center gap-3 card-hover ${
                    i === 0 ? "ring-2" : ""
                  }`}
                  style={{
                    background: i === 0 ? "var(--gradient-sky)" : "var(--color-surface)",
                    border: i === 0 ? "none" : "1px solid var(--color-border)",
                    boxShadow: i === 0 ? "0 4px 20px rgba(66,158,189,0.3)" : "0 2px 8px rgba(5,63,92,0.05)",
                  }}
                >
                  <p
                    className="text-xs font-700 uppercase tracking-widest"
                    style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-text-muted)" }}
                  >
                    {i === 0 ? "Today" : day.shortDay}
                  </p>
                  <WeatherIcon condition={day.condition} size={48} />
                  <div className="text-center">
                    <p
                      className="tabular-nums font-700 text-xl"
                      style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-sun)" }}
                    >
                      {day.high}°
                    </p>
                    <p
                      className="tabular-nums text-sm font-400"
                      style={{ color: i === 0 ? "rgba(5,63,92,0.6)" : "var(--color-text-muted)" }}
                    >
                      {day.low}°
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-3xl p-6"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h2 className="font-700 text-lg mb-3" style={{ color: "var(--color-deep)" }}>
                Weekly Outlook
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                A predominantly settled week ahead for South Tenerife. Temperatures climbing through Thursday, peaking at 28°C before a slight dip over the weekend as cloud builds along the north coast. UV remains high throughout - SPF protection essential. No significant rainfall expected in the south this week.
              </p>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === "Alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div
                className="rounded-3xl p-16 text-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(159,231,245,0.2)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="font-700 text-lg mb-2" style={{ color: "var(--color-deep)" }}>
                  No Active Weather Alerts
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Conditions are stable across Tenerife. This panel will show amber and red weather warnings when issued.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {alerts.map((alert) => (
                  <AlertBanner key={alert.id} level={alert.level} message={alert.message} id={alert.id} dismissible={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
