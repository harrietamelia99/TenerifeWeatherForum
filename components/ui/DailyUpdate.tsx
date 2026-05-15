import type { DailyUpdate } from "@/lib/getDailyUpdate";
import { AlertTriangle, Facebook } from "lucide-react";

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

  const isPending = update.source === "Pending";

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
              Tenerife Weather Update
            </p>
            <p className="text-white font-700 text-sm leading-none">
              {update.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isPending ? "#f59e0b" : "#22c55e" }}
          />
          <span className="text-xs text-white/60 whitespace-nowrap">
            {isPending ? "Forecast coming soon" : `Posted ${timeStr}`}
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

        {/* No warnings pill */}
        {!update.hasWarnings && !isPending && (
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

        {/* Forecast text */}
        <div>
          {!isPending && (
            <h3
              className="font-700 text-sm uppercase tracking-widest mb-3"
              style={{ color: "var(--color-deep)" }}
            >
              Forecast
            </h3>
          )}
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
