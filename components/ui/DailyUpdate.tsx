import type { DailyUpdate } from "@/lib/getDailyUpdate";
import { Wind, Thermometer, TrendingUp, AlertTriangle, Facebook } from "lucide-react";

interface Props {
  update: DailyUpdate;
}

export default function DailyUpdate({ update }: Props) {
  const postedDate = new Date(update.postedAt);
  const timeStr = postedDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Atlantic/Canary",
  });

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        border: "1px solid var(--color-border)",
        boxShadow: "0 4px 24px rgba(5,63,92,0.08)",
      }}
    >
      {/* Header bar */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ background: "var(--gradient-ocean)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Facebook size={17} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/50 font-semibold uppercase tracking-widest leading-none mb-0.5">
              Kevin&apos;s Daily Update
            </p>
            <p className="text-white font-700 text-sm leading-none">
              {update.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#22c55e" }}
          />
          <span className="text-xs text-white/60 whitespace-nowrap">
            Posted {timeStr}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        className="p-5 sm:p-6"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Active warning banner */}
        {update.hasWarnings && (
          <div
            className="flex items-start gap-3 rounded-2xl p-4 mb-5"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
            <p className="text-sm leading-relaxed" style={{ color: "#92400e" }}>
              {update.warnings}
            </p>
          </div>
        )}

        {/* North / South grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {[update.south, update.north].map((region) => (
            <div
              key={region.label}
              className="rounded-2xl p-4"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Region header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl leading-none">{region.emoji}</span>
                <p
                  className="font-700 text-sm leading-tight"
                  style={{ color: "var(--color-deep)" }}
                >
                  {region.label}
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-600"
                  style={{
                    background: "rgba(66,158,189,0.12)",
                    color: "var(--color-mid)",
                  }}
                >
                  <Thermometer size={11} />
                  Now {region.temperature}°C
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-600"
                  style={{
                    background: "rgba(247,173,25,0.12)",
                    color: "#b45309",
                  }}
                >
                  <TrendingUp size={11} />
                  High {region.high}°C
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-600"
                  style={{
                    background: "rgba(5,63,92,0.07)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Wind size={11} />
                  {region.wind}
                </span>
              </div>

              {/* Conditions */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {region.conditions}
              </p>
            </div>
          ))}
        </div>

        {/* No warnings pill */}
        {!update.hasWarnings && (
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 mb-5 w-fit"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#22c55e" }}
            />
            <p className="text-xs font-600" style={{ color: "#15803d" }}>
              {update.warnings}
            </p>
          </div>
        )}

        {/* Forecast */}
        <div>
          <h3
            className="font-700 text-sm uppercase tracking-widest mb-3"
            style={{ color: "var(--color-deep)" }}
          >
            Forecast
          </h3>
          {(update.forecast ?? "").split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed mb-3 last:mb-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
