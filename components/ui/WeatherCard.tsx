import Image from "next/image";
import WeatherIcon from "./WeatherIcon";
import type { WeatherData } from "@/types/weather";
import { Wind, Droplets, Sun, Thermometer } from "lucide-react";

interface WeatherCardProps {
  data: WeatherData;
  variant?: "light" | "dark" | "hero";
  className?: string;
  image?: string;
  imageAlt?: string;
}

export default function WeatherCard({ data, variant = "light", className = "", image, imageAlt }: WeatherCardProps) {
  const isHero = variant === "hero";
  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-3xl overflow-hidden relative ${className}`}
      style={{
        background: isDark
          ? "rgba(5,63,92,0.75)"
          : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: isDark
          ? "1px solid rgba(66,158,189,0.3)"
          : "1px solid rgba(200,238,247,0.8)",
        boxShadow: isDark
          ? "0 8px 32px rgba(5,63,92,0.3)"
          : "0 8px 32px rgba(5,63,92,0.08)",
      }}
    >
      {/* Optional top image */}
      {image && (
        <div className="relative w-full h-40 flex-shrink-0">
          <Image
            src={image}
            alt={imageAlt ?? data.location}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {/* Gradient fade into card body */}
          <div
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(to top, rgba(5,63,92,0.75), transparent)"
                : "linear-gradient(to top, rgba(255,255,255,0.85), transparent)",
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Background floating icon */}
      <div
        className="absolute -right-6 -top-6 opacity-10"
        aria-hidden="true"
        style={{ width: isHero ? 160 : 100, height: isHero ? 160 : 100 }}
      >
        <WeatherIcon
          condition={data.condition}
          size={isHero ? 160 : 100}
          className="!rounded-none !shadow-none !bg-transparent"
        />
      </div>

      <div className={`relative z-10 ${isHero ? "p-8 md:p-10" : "p-6"}`}>
        {/* Location & Date */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: isDark ? "rgba(159,231,245,0.8)" : "var(--color-text-muted)" }}
            >
              {data.date}
            </p>
            <h2
              className={`font-bold leading-tight ${isHero ? "text-2xl" : "text-lg"}`}
              style={{ color: isDark ? "white" : "var(--color-deep)" }}
            >
              {data.location}
            </h2>
          </div>
          <WeatherIcon condition={data.condition} size={isHero ? 80 : 56} />
        </div>

        {/* Temperature */}
        <div className="mb-6">
          <div className="flex items-end gap-2">
            <span
              className="tabular-nums leading-none"
              style={{
                fontSize: isHero ? "clamp(80px, 12vw, 120px)" : "4rem",
                fontWeight: 700,
                color: "var(--color-sun)",
                letterSpacing: "-2px",
              }}
            >
              {data.tempCurrent ?? data.tempHigh}
            </span>
            <span
              className="text-2xl font-300 mb-2"
              style={{ color: isDark ? "rgba(159,231,245,0.7)" : "var(--color-text-muted)" }}
            >
              °C
            </span>
          </div>
          <p
            className="text-sm font-500 uppercase tracking-widest mt-1"
            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }}
          >
            {conditionLabel(data.condition)} · High {data.tempHigh}° Low {data.tempLow}°
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-2">
          <StatTile
            icon={<Wind size={14} />}
            value={`${data.wind}`}
            unit="km/h"
            label="Wind"
            isDark={isDark}
          />
          <StatTile
            icon={<Sun size={14} />}
            value={`${data.uv}`}
            unit=""
            label="UV Index"
            isDark={isDark}
          />
          <StatTile
            icon={<Droplets size={14} />}
            value={`${data.humidity}`}
            unit="%"
            label="Humidity"
            isDark={isDark}
          />
          <StatTile
            icon={<Thermometer size={14} />}
            value={`${data.feelsLike ?? data.tempCurrent ?? data.tempHigh}`}
            unit="°"
            label="Feels Like"
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  value,
  unit,
  label,
  isDark,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl py-3 px-1"
      style={{
        background: isDark ? "rgba(5,63,92,0.45)" : "var(--color-bg)",
        border: isDark
          ? "1px solid rgba(66,158,189,0.2)"
          : "1px solid var(--color-border)",
      }}
    >
      <span style={{ color: isDark ? "rgba(159,231,245,0.7)" : "var(--color-mid)" }}>{icon}</span>
      <span
        className="tabular-nums font-700 text-base leading-none"
        style={{ color: isDark ? "white" : "var(--color-deep)" }}
      >
        {value}
        <span className="text-xs font-400" style={{ color: isDark ? "rgba(159,231,245,0.6)" : "var(--color-text-muted)" }}>
          {unit}
        </span>
      </span>
      <span
        className="text-xs font-500 uppercase tracking-wider text-center"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "var(--color-text-muted)", fontSize: "0.6rem" }}
      >
        {label}
      </span>
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
