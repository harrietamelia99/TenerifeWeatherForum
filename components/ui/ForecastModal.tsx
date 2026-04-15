"use client";

import { useEffect, useState } from "react";
import { X, CloudSun } from "lucide-react";

export default function ForecastModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-forecast-modal", handler);
    return () => window.removeEventListener("open-forecast-modal", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forecast-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "var(--gradient-ocean)" }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <CloudSun size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Wednesday, 15 April
              </p>
              <h2
                id="forecast-modal-title"
                className="text-xl font-bold text-white leading-tight"
              >
                Today&apos;s Forecast
              </h2>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close forecast"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-7 h-px bg-white/10" />

        {/* Body */}
        <div className="px-7 py-6">
          <p className="text-white/85 text-base leading-relaxed">
            Another mixed day across Tenerife. Southern resorts will see a good amount of sunshine, especially through the morning and early afternoon, with some cloud drifting through at times but staying largely dry.
          </p>
          <p className="text-white/85 text-base leading-relaxed mt-4">
            Northern areas will remain cloudier overall, with the chance of light drizzle at times, particularly through the morning and early afternoon. Breezy north easterly winds continue across exposed areas.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "South", value: "26°C", sub: "Sunny spells" },
              { label: "North", value: "21°C", sub: "Cloudy" },
              { label: "Mt Teide", value: "4°C", sub: "Clear summit" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                <p className="text-xs text-white/60 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7">
          <a
            href="/weather"
            className="btn-primary w-full text-center text-sm py-3"
            onClick={() => setOpen(false)}
          >
            Full Weather Details
          </a>
        </div>
      </div>
    </div>
  );
}
