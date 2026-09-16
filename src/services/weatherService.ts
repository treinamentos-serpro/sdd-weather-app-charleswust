import { getWeatherCondition } from "../lib/weatherCodes";
import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
} from "../types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Erro tipado para falhas na camada de acesso a dados da Open-Meteo.
export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherServiceError";
  }
}

const TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new WeatherServiceError("A requisição demorou demais.");
    }
    throw new WeatherServiceError("Falha de rede.");
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

function mapGeocodingResult(result: GeocodingResult): City {
  return {
    id: result.id,
    name: result.name,
    country: result.country,
    countryCode: result.country_code,
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  if (!name.trim()) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError("Não foi possível buscar as cidades.");
  }

  const data: GeocodingResponse = await response.json();

  return (data.results ?? []).map(mapGeocodingResult);
}

interface ForecastCurrent {
  time: string;
  temperature_2m: number | null;
  weather_code: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
}

interface ForecastDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_min: number[];
  temperature_2m_max: number[];
  precipitation_probability_max?: (number | null)[];
}

interface ForecastResponse {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: ForecastCurrent;
  daily?: ForecastDaily;
}

const FORECAST_DAYS = 5;

function mapCurrent(current: ForecastCurrent): CurrentWeather {
  return {
    temperatureCelsius: current.temperature_2m,
    weatherCode: current.weather_code,
    condition: getWeatherCondition(current.weather_code),
    time: current.time,
    relativeHumidity: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    precipitationMm: current.precipitation ?? 0,
    pressureHpa: current.surface_pressure,
  };
}

function mapDaily(daily: ForecastDaily): ForecastDay[] {
  return daily.time.slice(0, FORECAST_DAYS).map((date, index) => ({
    date,
    weatherCode: daily.weather_code[index] ?? null,
    condition: getWeatherCondition(daily.weather_code[index] ?? null),
    temperatureMinCelsius: daily.temperature_2m_min[index] ?? null,
    temperatureMaxCelsius: daily.temperature_2m_max[index] ?? null,
    precipitationProbabilityPercent:
      daily.precipitation_probability_max?.[index] ?? null,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      "temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code",
    daily:
      "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max",
    forecast_days: String(FORECAST_DAYS),
    temperature_unit: "celsius",
    timezone: "auto",
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError("Não foi possível buscar a previsão.");
  }

  const data: ForecastResponse = await response.json();

  if (!data.current || !data.daily) {
    throw new WeatherServiceError("Resposta incompleta do serviço de previsão.");
  }

  return {
    city,
    current: mapCurrent(data.current),
    forecast: mapDaily(data.daily),
    timezone: data.timezone ?? city.timezone ?? "",
    utcOffsetSeconds: data.utc_offset_seconds,
  };
}
