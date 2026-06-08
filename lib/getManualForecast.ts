import { kv } from "@vercel/kv";
import type { AlertLevel } from "@/types/weather";

const KV_KEY = "manual-forecast-text";

interface ManualForecastData {
  text: string;
  hasWarnings: boolean;
  warnings: string;
  warningLevel: AlertLevel;
  date: string; // YYYY-MM-DD in Canary time
}

function todayCanary(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Atlantic/Canary" });
}

export interface ManualForecastResult {
  text: string;
  hasWarnings: boolean;
  warnings: string;
  warningLevel: AlertLevel;
}

// Returns today's manually saved forecast data, or null if not posted yet.
export async function getManualForecastData(): Promise<ManualForecastResult | null> {
  try {
    const data = await kv.get<ManualForecastData>(KV_KEY);
    if (!data || data.date !== todayCanary()) return null;
    return {
      text: data.text,
      hasWarnings: data.hasWarnings,
      warnings: data.warnings,
      warningLevel: data.warningLevel ?? "yellow",
    };
  } catch (err) {
    console.error("[getManualForecast] KV read error:", err);
    return null;
  }
}

export async function saveManualForecast(
  text: string,
  hasWarnings: boolean,
  warnings: string,
  warningLevel: AlertLevel
): Promise<void> {
  await kv.set(KV_KEY, { text, hasWarnings, warnings, warningLevel, date: todayCanary() });
}
