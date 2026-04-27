import { getTickerData } from "@/lib/getWeather";

export default async function WeatherTicker() {
  const stats = await getTickerData();
  const allStats = [...stats, ...stats]; // duplicate for seamless loop

  return (
    <div
      className="overflow-hidden fixed top-0 left-0 right-0 z-[60]"
      style={{ background: "rgba(5,63,92,0.85)" }}
      aria-label="Live weather statistics"
    >
      <div
        className="flex items-center gap-0 py-3"
        style={{
          animation: "ticker 30s linear infinite",
          width: "max-content",
        }}
      >
        {allStats.map((stat, i) => (
          <div key={i} className="flex items-center gap-6 px-8">
            <span
              className="flex items-center gap-2 text-sm font-500 whitespace-nowrap"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
              <span
                className="tabular-nums font-700 text-base"
                style={{ color: "var(--color-sky)" }}
              >
                {stat.value}
              </span>
            </span>
            <span style={{ color: "rgba(159,231,245,0.3)" }}>·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
