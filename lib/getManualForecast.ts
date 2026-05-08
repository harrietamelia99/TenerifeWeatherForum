import { kv } from "@vercel/kv";

const KV_KEY = "manual-forecast-text";

interface ManualForecastText {
  text: string;
  date: string; // YYYY-MM-DD in Canary time
}

function todayCanary(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Atlantic/Canary" });
}

// Returns today's manually written forecast text, or null if not posted yet.
export async function getManualForecastText(): Promise<string | null> {
  try {
    const data = await kv.get<ManualForecastText>(KV_KEY);
    if (!data || data.date !== todayCanary()) return null;
    return data.text;
  } catch (err) {
    console.error("[getManualForecast] KV read error:", err);
    return null;
  }
}

export async function saveManualForecastText(text: string): Promise<void> {
  await kv.set(KV_KEY, { text, date: todayCanary() });
}
