import { NextResponse } from "next/server";
import {
  getLocationWeather,
  getSeaTemp,
  WEATHER_LOCATIONS,
} from "@/lib/getWeather";

export const revalidate = 1800;

export async function GET() {
  try {
    const south = WEATHER_LOCATIONS.playaAmericas;
    const north = WEATHER_LOCATIONS.puertoCruz;
    const teide = WEATHER_LOCATIONS.teide;

    const [southWeather, northWeather, teideWeather, seaTemp] = await Promise.all([
      getLocationWeather(south.lat, south.lon, south.name),
      getLocationWeather(north.lat, north.lon, north.name),
      getLocationWeather(teide.lat, teide.lon, teide.name),
      getSeaTemp(south.lat, south.lon),
    ]);

    return NextResponse.json({
      south: southWeather,
      north: northWeather,
      teide: teideWeather,
      seaTemp,
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
