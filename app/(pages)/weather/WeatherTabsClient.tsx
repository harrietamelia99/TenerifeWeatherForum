"use client";

import { useState, useEffect } from "react";
import WeatherCard from "@/components/ui/WeatherCard";
import AlertBanner from "@/components/ui/AlertBanner";
import WeatherIcon from "@/components/ui/WeatherIcon";
import { Clock } from "lucide-react";
import type { WeatherData, DayForecast, WeatherAlert } from "@/types/weather";

interface Props {
  currentWeather: WeatherData;
  weeklyForecast: DayForecast[];
  alerts: WeatherAlert[];
  seaTemp: number | null;
}

type Tab = "Today" | "This Week" | "Alerts";
const TABS: Tab[] = ["Today", "This Week", "Alerts"];

const ACTIVE_STYLE: React.CSSProperties = {
  background: "#053f5c",
  color: "#ffffff",
  boxShadow: "0 2px 8px rgba(5,63,92,0.25)",
};

const INACTIVE_STYLE: React.CSSProperties = {
  background: "transparent",
  color: "#429ebd",
  boxShadow: "none",
};

export default function WeatherTabsClient({ currentWeather, weeklyForecast, alerts, seaTemp }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Today");

  return (
    <div>
      {/* Active Alerts banner */}
      {alerts.length > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertBanner key={alert.id} level={alert.level} message={alert.message} id={alert.id} />
          ))}
        </div>
      )}

      {/* Tab nav */}
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 6,
          borderRadius: 9999,
          background: "rgba(5,63,92,0.08)",
          marginBottom: 32,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 9999,
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
              transition: "background 0.2s, color 0.2s",
              outline: "none",
              ...(activeTab === tab ? ACTIVE_STYLE : INACTIVE_STYLE),
            }}
          >
            {tab}
            {tab === "Alerts" && alerts.length > 0 && (
              <span
                style={{
                  background: "#dc2626",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TODAY ─────────────────────────────────────────────────────── */}
      {activeTab === "Today" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WeatherCard data={currentWeather} variant="light" className="mb-6" />
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
                  { label: "Sea Temperature", value: seaTemp != null ? `${seaTemp}°C` : `${currentWeather.seaTemp ?? "–"}°C`, sub: "Atlantic Ocean" },
                  { label: "Sunrise",          value: currentWeather.sunrise ?? "–",  sub: "Atlantic Time" },
                  { label: "Sunset",           value: currentWeather.sunset ?? "–",   sub: "Atlantic Time" },
                  {
                    label: "Wind Direction",
                    value: currentWeather.windDirection ?? "–",
                    sub: currentWeather.windDirection === "NE" ? "Northeasterly"
                       : currentWeather.windDirection === "N"  ? "Northerly"
                       : currentWeather.windDirection === "E"  ? "Easterly"
                       : currentWeather.windDirection === "SW" ? "Southwesterly"
                       : currentWeather.windDirection === "NW" ? "Northwesterly"
                       : "Variable",
                  },
                  { label: "Feels Like", value: currentWeather.feelsLike != null ? `${currentWeather.feelsLike}°C` : "–", sub: "With humidity" },
                  { label: "Humidity",   value: `${currentWeather.humidity}%`, sub: currentWeather.humidity < 50 ? "Low" : currentWeather.humidity < 70 ? "Moderate" : "High" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl p-4" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs font-500 uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>{item.label}</p>
                    <p className="tabular-nums font-700 text-lg" style={{ color: "var(--color-deep)" }}>{item.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-700 text-lg mb-5" style={{ color: "var(--color-deep)" }}>Latest Updates</h2>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl p-4" style={{ background: "rgba(159,231,245,0.1)", border: "1px solid rgba(66,158,189,0.2)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#22c55e" }} />
                  <span className="text-xs font-600" style={{ color: "var(--color-mid)" }}>Live data</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  Weather data updates every 30 minutes from Open-Meteo. {currentWeather.location}: {currentWeather.tempCurrent}°C, {currentWeather.condition.replace(/-/g, " ")}, wind {currentWeather.wind} km/h {currentWeather.windDirection}.
                </p>
              </div>
              <LiveUpdateItems weather={currentWeather} />
            </div>
          </div>
        </div>
      )}

      {/* ── THIS WEEK ─────────────────────────────────────────────────── */}
      {activeTab === "This Week" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mb-8">
            {weeklyForecast.map((day, i) => (
              <div
                key={day.day}
                className={`rounded-3xl p-5 flex flex-col items-center gap-3 ${i === 0 ? "ring-2" : ""}`}
                style={{
                  background: i === 0 ? "var(--gradient-sky)" : "var(--color-surface)",
                  border: i === 0 ? "none" : "1px solid var(--color-border)",
                  boxShadow: i === 0 ? "0 4px 20px rgba(66,158,189,0.3)" : "0 2px 8px rgba(5,63,92,0.05)",
                }}
              >
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-text-muted)" }}>
                  {i === 0 ? "Today" : day.shortDay}
                </p>
                <WeatherIcon condition={day.condition} size={48} />
                <div className="text-center">
                  <p className="tabular-nums font-700 text-xl" style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-sun)" }}>{day.high}°</p>
                  <p className="tabular-nums text-sm font-400" style={{ color: i === 0 ? "rgba(5,63,92,0.6)" : "var(--color-text-muted)" }}>{day.low}°</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="font-700 text-lg mb-3" style={{ color: "var(--color-deep)" }}>7-Day Outlook</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              7-day forecast for South Tenerife. Highs of {Math.max(...weeklyForecast.map((d) => d.high))}°C expected this week, lows around {Math.min(...weeklyForecast.map((d) => d.low))}°C. Data refreshes every 30 minutes.
            </p>
          </div>
        </div>
      )}

      {/* ── ALERTS ────────────────────────────────────────────────────── */}
      {activeTab === "Alerts" && (
        <div>
          {alerts.length === 0 ? (
            <div className="rounded-3xl p-16 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(159,231,245,0.2)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-700 text-lg mb-2" style={{ color: "var(--color-deep)" }}>No Active Weather Alerts</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Conditions are stable across Tenerife. This panel will show amber and red warnings when issued.
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
  );
}

function LiveUpdateItems({ weather }: { weather: WeatherData }) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    setDateStr(now.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  }, []);

  const conditionLabel = weather.condition.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const windDesc = weather.wind < 15 ? "light breeze" : weather.wind < 30 ? "moderate wind" : weather.wind < 50 ? "fresh wind" : "strong wind";

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 2px 12px rgba(5,63,92,0.06)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Clock size={12} style={{ color: "var(--color-text-muted)" }} />
        <span className="text-xs font-500" style={{ color: "var(--color-text-muted)" }}>
          {timeStr && dateStr ? `${timeStr} · ${dateStr}` : "Live"}
        </span>
      </div>
      <h3 className="font-600 text-sm mb-1.5" style={{ color: "var(--color-deep)" }}>
        {conditionLabel} — {weather.tempCurrent ?? weather.tempHigh}°C in South Tenerife
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {conditionLabel.toLowerCase()}, {windDesc} at {weather.wind} km/h{weather.windDirection ? ` from the ${weather.windDirection}` : ""}. Humidity {weather.humidity}%.
      </p>
    </div>
  );
}
