import Link from "next/link";
import WeatherCard from "@/components/ui/WeatherCard";
import AlertBanner from "@/components/ui/AlertBanner";
import WeatherIcon from "@/components/ui/WeatherIcon";
import LiveUpdateItems from "./LiveUpdateItems";
import type { WeatherData, DayForecast, WeatherAlert } from "@/types/weather";

type ActiveTab = "today" | "week" | "alerts";

interface Props {
  activeTab: ActiveTab;
  currentWeather: WeatherData;
  weeklyForecast: DayForecast[];
  alerts: WeatherAlert[];
  seaTemp: number | null;
}

const TABS: { id: ActiveTab; label: string; href: string }[] = [
  { id: "today",   label: "Today",     href: "/weather" },
  { id: "week",    label: "This Week", href: "/weather?tab=week" },
  { id: "alerts",  label: "Alerts",    href: "/weather?tab=alerts" },
];

export default function WeatherTabsClient({
  activeTab,
  currentWeather,
  weeklyForecast,
  alerts,
  seaTemp,
}: Props) {
  return (
    <div>
      {/* Active Alerts banner */}
      {alerts.length > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              level={alert.level}
              message={alert.message}
              id={alert.id}
            />
          ))}
        </div>
      )}

      {/* Tab nav — plain Next.js Links, no JavaScript event handling */}
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
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 9999,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                background: isActive ? "#053f5c" : "transparent",
                color: isActive ? "#ffffff" : "#429ebd",
                boxShadow: isActive ? "0 2px 8px rgba(5,63,92,0.25)" : "none",
              }}
            >
              {tab.label}
              {tab.id === "alerts" && alerts.length > 0 && (
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
            </Link>
          );
        })}
      </div>

      {/* Content area */}
      <div style={{ minHeight: "60vh" }}>

        {/* ── TODAY ───────────────────────────────────────────────────── */}
        {activeTab === "today" && (
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
                    {
                      label: "Sea Temperature",
                      value: seaTemp != null ? `${seaTemp}°C` : `${currentWeather.seaTemp ?? "–"}°C`,
                      sub: "Atlantic Ocean",
                    },
                    { label: "Sunrise",      value: currentWeather.sunrise ?? "–", sub: "Atlantic Time" },
                    { label: "Sunset",       value: currentWeather.sunset ?? "–",  sub: "Atlantic Time" },
                    {
                      label: "Wind Direction",
                      value: currentWeather.windDirection ?? "–",
                      sub:
                        currentWeather.windDirection === "NE" ? "Northeasterly"
                        : currentWeather.windDirection === "N"  ? "Northerly"
                        : currentWeather.windDirection === "E"  ? "Easterly"
                        : currentWeather.windDirection === "SW" ? "Southwesterly"
                        : currentWeather.windDirection === "NW" ? "Northwesterly"
                        : "Variable",
                    },
                    {
                      label: "Feels Like",
                      value: currentWeather.feelsLike != null ? `${currentWeather.feelsLike}°C` : "–",
                      sub: "With humidity",
                    },
                    {
                      label: "Humidity",
                      value: `${currentWeather.humidity}%`,
                      sub:
                        currentWeather.humidity < 50 ? "Low"
                        : currentWeather.humidity < 70 ? "Moderate"
                        : "High",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-4"
                      style={{
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <p
                        className="text-xs font-500 uppercase tracking-widest mb-2"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="tabular-nums font-700 text-lg"
                        style={{ color: "var(--color-deep)" }}
                      >
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
            <div>
              <h2 className="font-700 text-lg mb-5" style={{ color: "var(--color-deep)" }}>
                Latest Updates
              </h2>
              <div className="flex flex-col gap-4">
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(159,231,245,0.1)",
                    border: "1px solid rgba(66,158,189,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: "#22c55e" }}
                    />
                    <span className="text-xs font-600" style={{ color: "var(--color-mid)" }}>
                      Live data
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    Weather data updates every 30 minutes from Open-Meteo.{" "}
                    {currentWeather.location}: {currentWeather.tempCurrent}°C,{" "}
                    {currentWeather.condition.replace(/-/g, " ")}, wind {currentWeather.wind} km/h{" "}
                    {currentWeather.windDirection}.
                  </p>
                </div>
                <LiveUpdateItems weather={currentWeather} />
              </div>
            </div>
          </div>
        )}

        {/* ── THIS WEEK ───────────────────────────────────────────────── */}
        {activeTab === "week" && (
          <div>
            {/* Compact 7-day icon strip — quick visual overview */}
            <div
              className="flex gap-2 mb-8 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {weeklyForecast.map((day, i) => (
                <div
                  key={day.day + i}
                  className="flex-shrink-0 rounded-2xl px-3 py-4 flex flex-col items-center gap-2"
                  style={{
                    minWidth: 72,
                    background: i === 0 ? "var(--gradient-sky)" : "var(--color-surface)",
                    border: i === 0 ? "none" : "1px solid var(--color-border)",
                    boxShadow:
                      i === 0
                        ? "0 4px 16px rgba(66,158,189,0.25)"
                        : "0 1px 4px rgba(5,63,92,0.05)",
                  }}
                >
                  <p
                    className="text-xs font-700 uppercase tracking-wider"
                    style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-text-muted)" }}
                  >
                    {i === 0 ? "Today" : day.shortDay}
                  </p>
                  <WeatherIcon condition={day.condition} size={32} />
                  <p
                    className="tabular-nums font-700 text-base"
                    style={{ color: i === 0 ? "var(--color-deep)" : "var(--color-sun)" }}
                  >
                    {day.high}°
                  </p>
                  <p
                    className="tabular-nums text-xs"
                    style={{ color: i === 0 ? "rgba(255,255,255,0.75)" : "var(--color-text-muted)" }}
                  >
                    {day.low}°
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed day cards with written summaries */}
            <div className="flex flex-col gap-4">
              {weeklyForecast.map((day, i) => (
                <div
                  key={day.day + i + "detail"}
                  className="rounded-3xl p-5 sm:p-6"
                  style={{
                    background: i === 0 ? "rgba(159,231,245,0.12)" : "var(--color-surface)",
                    border: i === 0
                      ? "1.5px solid rgba(66,158,189,0.35)"
                      : "1px solid var(--color-border)",
                    boxShadow: "0 2px 10px rgba(5,63,92,0.05)",
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-start gap-4">
                    <WeatherIcon condition={day.condition} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                        <span
                          className="font-700 text-base"
                          style={{ color: "var(--color-deep)" }}
                        >
                          {i === 0 ? "Today" : day.day}
                        </span>
                        <span
                          className="text-xs font-500"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {day.date}
                        </span>
                      </div>
                      {/* Temp + badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="tabular-nums font-700 text-lg"
                          style={{ color: "var(--color-sun)" }}
                        >
                          {day.high}°
                        </span>
                        <span
                          className="tabular-nums text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          / {day.low}°
                        </span>
                        {day.wind >= 30 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-500"
                            style={{
                              background: "rgba(66,158,189,0.12)",
                              color: "var(--color-mid)",
                            }}
                          >
                            💨 {day.wind} km/h
                          </span>
                        )}
                        {day.uv >= 6 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-500"
                            style={{
                              background: day.uv >= 8
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(245,158,11,0.12)",
                              color: day.uv >= 8 ? "#dc2626" : "#d97706",
                            }}
                          >
                            🔆 UV {day.uv}
                          </span>
                        )}
                        {day.precipProb >= 30 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-500"
                            style={{
                              background: "rgba(59,130,246,0.1)",
                              color: "#3b82f6",
                            }}
                          >
                            🌧 {day.precipProb}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary text */}
                  <p
                    className="text-sm leading-relaxed mt-3"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {day.summary}
                  </p>

                  {/* North/south indicator if conditions differ */}
                  {day.northCondition !== day.condition && (
                    <div
                      className="flex items-center gap-3 mt-3 pt-3"
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <WeatherIcon condition={day.condition} size={18} />
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>South</span>
                      </div>
                      <span className="text-xs" style={{ color: "var(--color-border)" }}>·</span>
                      <div className="flex items-center gap-1.5">
                        <WeatherIcon condition={day.northCondition} size={18} />
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>North</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer note */}
            <p
              className="text-xs text-center mt-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              South Tenerife forecast · refreshes every 30 minutes · north/south differences shown where relevant
            </p>
          </div>
        )}

        {/* ── ALERTS ──────────────────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div
                className="rounded-3xl p-16 text-center"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(159,231,245,0.2)" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-mid)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="font-700 text-lg mb-2" style={{ color: "var(--color-deep)" }}>
                  No Active Weather Alerts
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Conditions are stable across Tenerife. This panel will show amber and red warnings
                  when issued.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {alerts.map((alert) => (
                  <AlertBanner
                    key={alert.id}
                    level={alert.level}
                    message={alert.message}
                    id={alert.id}
                    dismissible={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
