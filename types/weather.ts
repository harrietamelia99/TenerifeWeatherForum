export type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "showers"
  | "thunderstorm"
  | "windy"
  | "fog"
  | "clear";

export interface WeatherData {
  location: string;
  date: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  tempCurrent?: number;
  feelsLike?: number;
  wind: number;
  windDirection?: string;
  uv: number;
  humidity: number;
  sunrise?: string;
  sunset?: string;
  seaTemp?: number;
}

export interface DayForecast {
  day: string;
  shortDay: string;
  date: string;           // e.g. "12 May"
  condition: WeatherCondition;
  northCondition: WeatherCondition;
  high: number;
  low: number;
  wind: number;           // daily max wind km/h
  uv: number;             // daily max UV index
  precipProb: number;     // precipitation probability %
  summary: string;        // generated Tenerife-specific text
}

export interface ClimateMonth {
  month: string;
  avgHigh: number;
  avgLow: number;
  sunshineHours: number;
  rainfallMm: number;
  seaTemp: number;
}

export interface RegionData {
  region: string;
  slug: string;
  condition: WeatherCondition;
  temp: number;
  description: string;
  bestTime: string;
  gradient: string;
}

export type AlertLevel = "info" | "yellow" | "amber" | "red";

export interface WeatherAlert {
  level: AlertLevel;
  message: string;
  id: string;
}
