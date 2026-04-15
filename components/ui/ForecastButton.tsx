"use client";

export default function ForecastButton({ className }: { className?: string }) {
  return (
    <button
      className={className ?? "btn-primary"}
      onClick={() => window.dispatchEvent(new Event("open-forecast-modal"))}
    >
      Today&apos;s Forecast
    </button>
  );
}
