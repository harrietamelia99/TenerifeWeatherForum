import type { DailyUpdate } from "@/lib/getDailyUpdate";

// ─── WMO code helpers ─────────────────────────────────────────────────────────

const WMO_LABEL: Record<number, string> = {
  0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "freezing fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain",
  80: "light showers", 81: "showers", 82: "heavy showers",
  95: "thunderstorms", 96: "thunderstorms", 99: "thunderstorms with hail",
};

const WMO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  80: "🌦️", 81: "🌦️", 82: "🌧️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

// ─── Fetch one location from Open-Meteo ──────────────────────────────────────

async function fetchLoc(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Atlantic%2FCanary&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  const d = await res.json();
  const code: number = d.current.weather_code;

  const temp = Math.round(d.current.temperature_2m);
  const forecastHigh = Math.round(d.daily.temperature_2m_max[0]);
  return {
    temp,
    // Never show a daily high lower than the current temperature
    high:     Math.max(temp, forecastHigh),
    low:      Math.round(d.daily.temperature_2m_min[0]),
    wind:     Math.round(d.current.wind_speed_10m),
    gust:     Math.round(d.current.wind_gusts_10m),
    humidity: Math.round(d.current.relative_humidity_2m),
    uv:       Math.round(d.current.uv_index),
    code,
    label:    WMO_LABEL[code] ?? "variable conditions",
    emoji:    WMO_EMOJI[code] ?? "🌤️",
  };
}

// ─── Template forecast (works with no API key) ────────────────────────────────

function templateForecast(south: Awaited<ReturnType<typeof fetchLoc>>, north: Awaited<ReturnType<typeof fetchLoc>>) {
  const isWarm = south.temp >= 22;
  const southDry = south.code <= 3;
  const northWet = north.code >= 51;

  const southLine = southDry
    ? `Mostly ${south.label} across the south today. Temperatures reaching a high of ${south.high}°C with winds of ${south.wind}–${south.gust} km/h.`
    : `${south.label.charAt(0).toUpperCase() + south.label.slice(1)} expected in the south. High of ${south.high}°C with winds of ${south.wind}–${south.gust} km/h.`;

  const northLine = northWet
    ? `The north looks more unsettled with ${north.label} likely at times. High of ${north.high}°C, winds ${north.wind}–${north.gust} km/h.`
    : `${north.label.charAt(0).toUpperCase() + north.label.slice(1)} across the north. High of ${north.high}°C with winds of ${north.wind}–${north.gust} km/h.`;

  const uvNote = south.uv >= 8
    ? " UV levels are very high today — SPF 50+ essential even in the shade."
    : south.uv >= 6 ? " UV levels are high — sun protection recommended." : "";

  return {
    southConditions: southLine,
    northConditions: northLine,
    forecast: `A ${isWarm ? "warm" : "mild"} day ahead across Tenerife with the typical north–south split. The south stays ${southDry ? "largely dry" : "mixed"} while the north sees ${northWet ? "more cloud and rain" : "similar conditions"}.${uvNote}\n\nConditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another.`,
  };
}

// ─── AI forecast via OpenAI ───────────────────────────────────────────────────

async function aiForecast(
  south: Awaited<ReturnType<typeof fetchLoc>>,
  north: Awaited<ReturnType<typeof fetchLoc>>,
  medano: Awaited<ReturnType<typeof fetchLoc>>,
  teide: Awaited<ReturnType<typeof fetchLoc>>
) {
  const prompt = `You write daily weather updates for a Tenerife travel forum. Write in friendly British English — like a knowledgeable local. Concise, warm, no hyperbole.

Live weather data:
- South (Playa de las Américas): ${south.temp}°C now, high ${south.high}°C, ${south.label}, wind ${south.wind}–${south.gust} km/h, UV ${south.uv}
- North (Puerto de la Cruz): ${north.temp}°C now, high ${north.high}°C, ${north.label}, wind ${north.wind}–${north.gust} km/h
- El Médano: ${medano.temp}°C, ${medano.label}, wind ${medano.wind}–${medano.gust} km/h
- Mt Teide: ${teide.temp}°C, ${teide.label}

Return only JSON, no markdown:
{
  "southConditions": "2 sentences about south Tenerife today",
  "northConditions": "2 sentences about north Tenerife today",
  "forecast": "Two short paragraphs. Para 1: island overview. Para 2: must end with the standard Tenerife microclimate disclaimer."
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
    southConditions: string;
    northConditions: string;
    forecast: string;
  };
}

// ─── Shared placeholder ───────────────────────────────────────────────────────

function makePlaceholder(): DailyUpdate {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Atlantic/Canary",
  });
  return {
    date: dateStr,
    south: { emoji: "🌤️", label: "Tenerife South (Costa Adeje / Playa de las Américas)", temperature: 22, high: 25, conditions: "Forecast loading — check back shortly.", wind: "15–25 km/h" },
    north: { emoji: "⛅", label: "Tenerife North (Santa Cruz / Puerto de la Cruz)", temperature: 18, high: 21, conditions: "Forecast loading — check back shortly.", wind: "18–30 km/h" },
    warnings: "There are no active weather warnings for Tenerife today.",
    hasWarnings: false,
    forecast: "Today's forecast is loading. Please check back shortly.",
    postedAt: new Date().toISOString(),
    source: "Placeholder",
  };
}

// ─── Core generation ──────────────────────────────────────────────────────────

async function generate(): Promise<DailyUpdate> {
  try {
    // All four locations in one go — const inside try so TypeScript knows they're defined
    const [south, north, medano, teide] = await Promise.all([
      fetchLoc(28.0573, -16.7146),
      fetchLoc(28.4142, -16.5484),
      fetchLoc(28.0449, -16.5380),
      fetchLoc(28.2723, -16.6423),
    ]);

    // Build conditions via AI or template
    let conditions: { southConditions: string; northConditions: string; forecast: string };
    if (process.env.OPENAI_API_KEY) {
      try {
        const ai = await aiForecast(south, north, medano, teide);
        // Validate AI returned all required fields — fall back if not
        if (ai?.southConditions && ai?.northConditions && ai?.forecast) {
          conditions = ai;
        } else {
          conditions = templateForecast(south, north);
        }
      } catch {
        conditions = templateForecast(south, north);
      }
    } else {
      conditions = templateForecast(south, north);
    }

    const warningCodes = [61, 63, 65, 80, 81, 82, 95, 96, 99];
    const hasWarnings = warningCodes.includes(south.code) || warningCodes.includes(north.code);

    const dateStr = new Date().toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "Atlantic/Canary",
    });

    return {
      date: dateStr,
      south: {
        emoji: south.emoji,
        label: "Tenerife South (Costa Adeje / Playa de las Américas)",
        temperature: south.temp,
        high: south.high,
        conditions: conditions.southConditions,
        wind: `${south.wind}–${south.gust} km/h`,
      },
      north: {
        emoji: north.emoji,
        label: "Tenerife North (Santa Cruz / Puerto de la Cruz)",
        temperature: north.temp,
        high: north.high,
        conditions: conditions.northConditions,
        wind: `${north.wind}–${north.gust} km/h`,
      },
      warnings: hasWarnings
        ? "Weather activity expected today — check Met Office forecasts before travelling."
        : "There are no active weather warnings for Tenerife today.",
      hasWarnings,
      forecast: conditions.forecast,
      postedAt: new Date().toISOString(),
      source: process.env.OPENAI_API_KEY ? "AI Generated" : "Auto Template",
    };
  } catch {
    // Any unexpected error — return safe placeholder rather than crashing
    return makePlaceholder();
  }
}

// ─── Exported function ────────────────────────────────────────────────────────
// Called directly from the weather page. The page is force-dynamic so this
// runs fresh on each request. Results are cached at Vercel's edge layer.

export const getForecast = generate;
