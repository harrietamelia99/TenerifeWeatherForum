import { kv } from "@vercel/kv";
import type { DailyUpdate } from "@/lib/getDailyUpdate";

const KV_KEY = "manual-forecast";

// Returns today's manual forecast if Kevin has posted one, otherwise null.
export async function getManualForecast(): Promise<DailyUpdate | null> {
  try {
    const data = await kv.get<DailyUpdate & { _date: string }>(KV_KEY);
    if (!data) return null;

    // en-CA gives YYYY-MM-DD format — compare against today in Canary time
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Atlantic/Canary",
    });
    if (data._date !== today) return null;

    const { _date: _removed, ...forecast } = data;
    return forecast as DailyUpdate;
  } catch (err) {
    console.error("[getManualForecast] KV read error:", err);
    return null;
  }
}

export async function saveManualForecast(forecast: DailyUpdate): Promise<void> {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Atlantic/Canary",
  });
  await kv.set(KV_KEY, { ...forecast, _date: today });
}
