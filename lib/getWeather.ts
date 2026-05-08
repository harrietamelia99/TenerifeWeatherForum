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

  const tempCurrent = Math.round(cur.temperature_2m ?? 22);
  const forecastHigh = Math.round((day.temperature_2m_max?.[0] as number) ?? 25);
  return {
    location: locationName,
    date: dateStr,
    condition: wmoToCondition(cur.weather_code ?? 0),
    tempCurrent,
    feelsLike: Math.round(cur.apparent_temperature ?? 22),
    // Never show daily high lower than the current temperature
    tempHigh: Math.max(tempCurrent, forecastHigh),
    tempLow: Math.round((day.temperature_2m_min?.[0] as number) ?? 17),
    wind: Math.round(cur.wind_speed_10m ?? 15),
    windDirection: windDir,
    uv: Math.round(cur.uv_index ?? 5),
    humidity: Math.round(cur.relative_humidity_2m ?? 60),
    sunrise: parseSunTime(day.sunrise as unknown[]),
    sunset: parseSunTime(day.sunset as unknown[]),
  };
}

// ─── Summary generator ───────────────────────────────────────────────────────
// Produces 1–2 natural sentences per day from raw forecast data.

function generateDaySummary(
  southCode: number,
  northCode: number,
  wind: number,
  uv: number,
  precipProb: number,
  precipSum: number,
): string {
  const southSunny   = southCode <= 1;
  const southPartly  = southCode === 2;
  const southCloudy  = southCode === 3;
  const southRainy   = southCode >= 51;
  const northCloudier = northCode > southCode + 1;
  const northRainy   = northCode >= 51;

  // Sky condition sentence
  let sky: string;
  if (southSunny && !northCloudier) {
    sky = "Clear skies and sunshine expected across most of the island.";
  } else if (southSunny && northCloudier && !northRainy) {
    sky = "Sunny in the south with cloud building across the north through the day.";
  } else if (southSunny && northRainy) {
    sky = "Sunshine in the south while the north sees cloud and rain.";
  } else if (southPartly && northCloudier) {
    sky = "Some sunny spells across the south with cloudier conditions in the north.";
  } else if (southPartly && !northCloudier) {
    sky = "Partly cloudy across the island with intervals of sunshine expected.";
  } else if (southCloudy && northRainy) {
    sky = "Overcast in the south with rain likely across the north.";
  } else if (southCloudy) {
    sky = "Overcast across much of the island with limited sunshine.";
  } else if (southRainy && northRainy) {
    sky = `${wmoToLabel(southCode)} likely across both the south and north today.`;
  } else if (southRainy) {
    sky = `${wmoToLabel(southCode)} expected across the south, drier in the north.`;
  } else {
    sky = `${wmoToLabel(southCode)} in the south, ${wmoToLabel(northCode).toLowerCase()} across the north.`;
  }

  // Additional detail fragments
  const details: string[] = [];

  if (precipProb >= 60 && !southRainy) {
    details.push(`${precipProb}% chance of rain.`);
  } else if (precipSum >= 5) {
    details.push("Significant rainfall possible.");
  } else if (precipProb >= 30 && precipProb < 60) {
    details.push("Some rain possible.");
  }

  if (wind >= 45) {
    details.push(`Strong winds, gusts up to ${wind} km/h.`);
  } else if (wind >= 30) {
    details.push(`Breezy, winds up to ${wind} km/h.`);
  }

  if (uv >= 8 && southCode <= 2) {
    details.push("UV very high — sun protection essential.");
  } else if (uv >= 6 && southCode <= 2) {
    details.push(`UV ${uv} — high. Sun protection recommended.`);
  }

  return details.length > 0 ? `${sky} ${details.join(" ")}` : sky;
}

// ─── Fetch 7-day forecast (south + north combined) ───────────────────────────
// No location params — always fetches Tenerife south (primary) and north
// (for comparison), plus extra daily fields to power written summaries.

export async function getWeeklyForecast(): Promise<DayForecast[]> {
  const baseFields =
    "temperature_2m_max,temperature_2m_min,weather_code," +
    "wind_speed_10m_max,uv_index_max,precipitation_sum,precipitation_probability_max";

  const southUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=28.0573&longitude=-16.7146` +
    `&daily=${baseFields}&timezone=Atlantic%2FCanary&forecast_days=7`;

  const northUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=28.4142&longitude=-16.5484` +
    `&daily=weather_code&timezone=Atlantic%2FCanary&forecast_days=7`;

  let southData: Record<string, Record<string, unknown[]>>;
  let northData: Record<string, Record<string, unknown[]>> | null = null;

  try {
    const [southRes, northRes] = await Promise.all([
      fetch(southUrl, { next: { revalidate: 1800 } }),
      fetch(northUrl, { next: { revalidate: 1800 } }),
    ]);
    if (!southRes.ok) return [];
    southData = await southRes.json();
    if (northRes.ok) northData = await northRes.json();
  } catch {
    return [];
  }

  const days  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const short = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (southData.daily.time as string[]).map((dateStr: string, i: number) => {
    const dow        = new Date(dateStr).getDay();
    const southCode  = southData.daily.weather_code[i] as number;
    const northCode  = (northData?.daily?.weather_code?.[i] as number) ?? southCode;
    const wind       = Math.round((southData.daily.wind_speed_10m_max[i] as number) ?? 0);
    const uv         = Math.round((southData.daily.uv_index_max[i] as number) ?? 0);
    const precipProb = Math.round((southData.daily.precipitation_probability_max[i] as number) ?? 0);
    const precipSum  = Math.round((southData.daily.precipitation_sum[i] as number) ?? 0);

    const dateObj = new Date(dateStr);
    const dateDisplay = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    return {
      day:            days[dow],
      shortDay:       short[dow],
      date:           dateDisplay,
      condition:      wmoToCondition(southCode),
      northCondition: wmoToCondition(northCode),
      high:           Math.round(southData.daily.temperature_2m_max[i] as number),
      low:            Math.round(southData.daily.temperature_2m_min[i] as number),
      wind,
      uv,
      precipProb,
      summary:        generateDaySummary(southCode, northCode, wind, uv, precipProb, precipSum),
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
