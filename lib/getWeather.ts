import type { WeatherData, WeatherCondition, DayForecast } from "@/types/weather";

// ─── WMO weather code → our condition type ───────────────────────────────────
function wmoToCondition(code: number): WeatherCondition {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "cloudy"; // snow — shows as cloudy
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95) return "thunderstorm";
  return "partly-cloudy";
}

function wmoToLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 61) return "Light rain";
  if (code === 63) return "Rain";
  if (code === 65) return "Heavy rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 80) return "Light showers";
  if (code === 81) return "Showers";
  if (code === 82) return "Heavy showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Variable";
}

// ─── Locations ───────────────────────────────────────────────────────────────
export const WEATHER_LOCATIONS = {
  playaAmericas: { name: "Playa de las Américas", lat: 28.0573, lon: -16.7146 },
  puertoCruz:    { name: "Puerto de la Cruz",     lat: 28.4142, lon: -16.5484 },
  santaCruz:     { name: "Santa Cruz",            lat: 28.4636, lon: -16.2518 },
  elMedano:      { name: "El Médano",             lat: 28.0449, lon: -16.5380 },
  losGigantes:   { name: "Los Gigantes",          lat: 28.2449, lon: -16.8393 },
  teide:         { name: "Mount Teide",           lat: 28.2723, lon: -16.6423 },
} as const;

// ─── Fallback data shown if API is unreachable at build time ─────────────────
function weatherFallback(locationName: string): WeatherData {
  const now = new Date();
  return {
    location: locationName,
    date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    condition: "partly-cloudy",
    tempCurrent: 22, feelsLike: 22, tempHigh: 25, tempLow: 17,
    wind: 15, windDirection: "NE", uv: 6, humidity: 60,
    sunrise: "07:20", sunset: "20:45", seaTemp: 21,
  };
}

// ─── Fetch current + daily weather for one location ──────────────────────────
export async function getLocationWeather(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,wind_direction_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset` +
    `&timezone=Atlantic%2FCanary&forecast_days=1`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return weatherFallback(locationName);
  } catch {
    return weatherFallback(locationName);
  }
  let d: Record<string, unknown>;
  try {
    d = await res.json();
  } catch {
    return weatherFallback(locationName);
  }

  // Guard: if the response shape is unexpected, fall back gracefully
  const cur = d.current as Record<string, number> | undefined;
  const day = d.daily as Record<string, unknown[]> | undefined;
  if (!cur || !day) return weatherFallback(locationName);

  // Cardinal wind direction from degrees
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  const windDir = dirs[Math.round((cur.wind_direction_10m ?? 0) / 45) % 8];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // sunrise/sunset come as "2026-04-27T07:20" — extract the time portion safely
  const parseSunTime = (arr: unknown[] | undefined) =>
    typeof arr?.[0] === "string" ? (arr[0] as string).split("T")[1] ?? undefined : undefined;

  return {
    location: locationName,
    date: dateStr,
    condition: wmoToCondition(cur.weather_code ?? 0),
    tempCurrent: Math.round(cur.temperature_2m ?? 22),
    feelsLike: Math.round(cur.apparent_temperature ?? 22),
    tempHigh: Math.round((day.temperature_2m_max?.[0] as number) ?? 25),
    tempLow: Math.round((day.temperature_2m_min?.[0] as number) ?? 17),
    wind: Math.round(cur.wind_speed_10m ?? 15),
    windDirection: windDir,
    uv: Math.round(cur.uv_index ?? 5),
    humidity: Math.round(cur.relative_humidity_2m ?? 60),
    sunrise: parseSunTime(day.sunrise as unknown[]),
    sunset: parseSunTime(day.sunset as unknown[]),
  };
}

// ─── Fetch 7-day forecast for one location ───────────────────────────────────
export async function getWeeklyForecast(lat: number, lon: number): Promise<DayForecast[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=Atlantic%2FCanary&forecast_days=7`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
  } catch {
    return [];
  }
  const d = await res.json();

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const short = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return d.daily.time.map((dateStr: string, i: number) => {
    const dow = new Date(dateStr).getDay();
    return {
      day: days[dow],
      shortDay: short[dow],
      condition: wmoToCondition(d.daily.weather_code[i]),
      high: Math.round(d.daily.temperature_2m_max[i]),
      low: Math.round(d.daily.temperature_2m_min[i]),
    };
  });
}

// ─── Fetch sea surface temperature ───────────────────────────────────────────
export async function getSeaTemp(lat: number, lon: number): Promise<number | null> {
  try {
    const url =
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=sea_surface_temperature` +
      `&timezone=Atlantic%2FCanary`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const d = await res.json();
    return Math.round(d.current.sea_surface_temperature);
  } catch {
    return null;
  }
}

// ─── Fetch weather for all ticker locations ───────────────────────────────────
export interface TickerData {
  label: string;
  value: string;
  icon: string;
}

export async function getTickerData(): Promise<TickerData[]> {
  try {
    const [south, north, medano, teide, seaTemp] = await Promise.all([
      getLocationWeather(WEATHER_LOCATIONS.playaAmericas.lat, WEATHER_LOCATIONS.playaAmericas.lon, "South Tenerife"),
      getLocationWeather(WEATHER_LOCATIONS.puertoCruz.lat, WEATHER_LOCATIONS.puertoCruz.lon, "North Tenerife"),
      getLocationWeather(WEATHER_LOCATIONS.elMedano.lat, WEATHER_LOCATIONS.elMedano.lon, "El Médano"),
      getLocationWeather(WEATHER_LOCATIONS.teide.lat, WEATHER_LOCATIONS.teide.lon, "Mount Teide"),
      getSeaTemp(WEATHER_LOCATIONS.playaAmericas.lat, WEATHER_LOCATIONS.playaAmericas.lon),
    ]);

    return [
      { label: "South Tenerife", value: `${south.tempCurrent}°C`, icon: "☀️" },
      { label: "North Tenerife", value: `${north.tempCurrent}°C`, icon: "⛅" },
      { label: "El Médano",      value: `${medano.tempCurrent}°C`, icon: "💨" },
      { label: "Sea Temp",       value: `${seaTemp ?? south.seaTemp ?? "–"}°C`, icon: "🌊" },
      { label: "UV Index",       value: `${south.uv} ${south.uv >= 8 ? "Very High" : south.uv >= 6 ? "High" : "Moderate"}`, icon: "🔆" },
      { label: "Humidity",       value: `${south.humidity}%`, icon: "💧" },
      { label: "Wind",           value: `${south.wind} km/h`, icon: "🌬️" },
      { label: "Mount Teide",    value: `${teide.tempCurrent}°C`, icon: "🏔️" },
    ];
  } catch {
    // Fallback to static values if API fails
    return [
      { label: "South Tenerife", value: "–°C", icon: "☀️" },
      { label: "Sea Temp",       value: "–°C", icon: "🌊" },
      { label: "UV Index",       value: "–",   icon: "🔆" },
    ];
  }
}

// ─── Convenience: get homepage weather (south + sea temp) ────────────────────
export async function getHomepageWeather(): Promise<WeatherData> {
  try {
    const loc = WEATHER_LOCATIONS.playaAmericas;
    const [weather, seaTemp] = await Promise.all([
      getLocationWeather(loc.lat, loc.lon, loc.name),
      getSeaTemp(loc.lat, loc.lon),
    ]);
    return { ...weather, seaTemp: seaTemp ?? undefined };
  } catch {
    return weatherFallback("Playa de las Américas");
  }
}

export { wmoToLabel };
