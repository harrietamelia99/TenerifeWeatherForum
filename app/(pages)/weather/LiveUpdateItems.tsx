"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import type { WeatherData } from "@/types/weather";

export default function LiveUpdateItems({ weather }: { weather: WeatherData }) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    setDateStr(now.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  }, []);

  const conditionLabel = weather.condition
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const windDesc =
    weather.wind < 15
      ? "light breeze"
      : weather.wind < 30
      ? "moderate wind"
      : weather.wind < 50
      ? "fresh wind"
      : "strong wind";

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 2px 12px rgba(5,63,92,0.06)",
      }}
    >
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
        {conditionLabel.toLowerCase()}, {windDesc} at {weather.wind} km/h
        {weather.windDirection ? ` from the ${weather.windDirection}` : ""}. Humidity{" "}
        {weather.humidity}%.
      </p>
    </div>
  );
}
