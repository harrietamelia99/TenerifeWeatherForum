"use client";

import { useEffect, useState } from "react";
import { X, CloudSun, Copy, Check, Facebook } from "lucide-react";
import type { DailyUpdate } from "@/lib/getDailyUpdate";

type Status = "idle" | "loading" | "ready" | "error";

// Build the formatted Facebook post text — matches Kevin's exact posting format
function buildFacebookPost(update: DailyUpdate): string {
  // Forecast paragraphs use a single newline between them (no blank lines)
  const forecast = update.forecast.replace(/\n\n+/g, "\n");

  return `Tenerife Weather Update
${update.date}
${update.south.emoji} ${update.south.label}
• Temperature: ${update.south.temperature} °C
• High: ${update.south.high} °C
• Conditions: ${update.south.conditions}
• Wind: ${update.south.wind}
${update.north.emoji} ${update.north.label}
• Temperature: ${update.north.temperature} °C
• High: ${update.north.high} °C
• Conditions: ${update.north.conditions}
• Wind: ${update.north.wind}
⚠️ Weather Warnings
${update.warnings}
Forecast
${forecast}`;
}

export default function ForecastModal() {
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState<DailyUpdate | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);

  // Listen for the open event
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      if (status === "idle") {
        setStatus("loading");
        fetch("/api/daily-update")
          .then((r) => {
            if (!r.ok) throw new Error(`API error ${r.status}`);
            return r.json();
          })
          .then((d: DailyUpdate) => {
            // Validate the shape before rendering — guards against error JSON
            if (!d?.south || !d?.north || typeof d?.forecast !== "string") {
              throw new Error("Unexpected response shape");
            }
            setUpdate(d);
            setStatus("ready");
          })
          .catch(() => setStatus("error"));
      }
    };
    window.addEventListener("open-forecast-modal", handler);
    return () => window.removeEventListener("open-forecast-modal", handler);
  }, [status]);

  // Escape key + body scroll lock
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

  const handleCopy = async () => {
    if (!update) return;
    const text = buildFacebookPost(update);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API not available — fall back to textarea trick
      const el = document.getElementById("fb-post-text") as HTMLTextAreaElement | null;
      if (el) {
        el.style.position = "fixed";
        el.style.opacity = "0";
        el.select();
        document.execCommand("copy");
        el.style.position = "";
        el.style.opacity = "";
      }
    }
    setCopied(true);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
    setTimeout(() => setCopied(false), 8000);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
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

      {/* Panel — slides up on mobile, centered on desktop */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
        style={{ background: "var(--gradient-ocean)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <CloudSun size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 leading-none mb-1">
                {update?.date ?? new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
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

        <div className="mx-6 h-px bg-white/10 flex-shrink-0" />

        {/* Copied toast — slides in below the header */}
        <div
          className="overflow-hidden transition-all duration-300 flex-shrink-0"
          style={{ maxHeight: toast ? "80px" : "0px", opacity: toast ? 1 : 0 }}
        >
          <div className="mx-6 mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)" }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.3)" }}
            >
              <Check size={14} className="text-green-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Copied to clipboard!</p>
              <p className="text-xs text-white/60 leading-tight mt-0.5">Ready to paste into your Facebook post</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {status === "loading" && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          )}

          {status === "error" && (
            <p className="text-white/60 text-sm text-center py-8">
              Couldn&apos;t load today&apos;s forecast. Try again shortly.
            </p>
          )}

          {status === "ready" && update && (
            <>
              {/* South / North quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[update.south, update.north].map((region) => (
                  <div
                    key={region.label}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-lg leading-none">{region.emoji}</span>
                      <span className="text-xs text-white/60 font-semibold leading-tight">
                        {region.label.includes("South") ? "South" : "North"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums leading-none mb-1">
                      {region.temperature}°C
                    </p>
                    <p className="text-xs text-white/50">High {region.high}°C · {region.wind}</p>
                  </div>
                ))}
              </div>

              {/* South conditions */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                  South — {update.south.label.replace(/^Tenerife South \(/, "").replace(/\)$/, "")}
                </p>
                <p className="text-white/85 text-sm leading-relaxed">{update.south.conditions}</p>
              </div>

              {/* North conditions */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                  North — {update.north.label.replace(/^Tenerife North \(/, "").replace(/\)$/, "")}
                </p>
                <p className="text-white/85 text-sm leading-relaxed">{update.north.conditions}</p>
              </div>

              {/* Warnings */}
              {update.hasWarnings && (
                <div
                  className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2"
                  style={{ background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.3)" }}
                >
                  <span className="text-base leading-none flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs text-yellow-100/90 leading-relaxed">{update.warnings}</p>
                </div>
              )}

              {/* Forecast */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                  Forecast
                </p>
                {(update.forecast ?? "").split("\n\n").map((para, i) => (
                  <p key={i} className="text-white/75 text-sm leading-relaxed mb-2 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>

              {/* Hidden textarea for clipboard fallback */}
              <textarea
                id="fb-post-text"
                className="sr-only"
                readOnly
                value={buildFacebookPost(update)}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="px-6 pb-6 pt-3 flex flex-col gap-3 flex-shrink-0 border-t border-white/10">
          {/* Copy + Share buttons */}
          {status === "ready" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300"
                style={{
                  background: copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.15)",
                  border: `1px solid ${copied ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.2)"}`,
                  color: "white",
                }}
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    Post text copied to clipboard!
                  </>
                ) : (
                  <>
                  <Copy size={15} />
                  Copy &amp; Share to Facebook
                  </>
                )}
              </button>

              {copied && (
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(24,119,242,0.25)",
                    border: "1px solid rgba(24,119,242,0.4)",
                    color: "white",
                  }}
                >
                  <Facebook size={15} />
                  Open Facebook &amp; paste
                </a>
              )}
            </div>
          )}

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
