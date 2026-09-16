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
const TIMEOUT_SECONDS = TIMEOUT_MS / 1_000;

function toFiniteNumber(value: number | null | undefined): number | null {
  return value !== null && value !== undefined && Number.isFinite(value) ? value : null;
}

function toFiniteOptionalNumber(value: number | null | undefined): number | undefined {
  const normalized = toFiniteNumber(value);
  return normalized ?? undefined;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new WeatherServiceError(
        `A conexão demorou mais de ${TIMEOUT_SECONDS} segundos. Tente novamente.`,
      );
    }
    throw new WeatherServiceError(
      "Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError(
      "O serviço de clima retornou uma resposta inválida. Tente novamente.",
    );
  }
}

function getHttpErrorMessage(response: Response, resource: string): string {
  if (response.status === 429) {
    return "Muitas tentativas foram feitas. Aguarde um pouco e tente novamente.";
  }

  if (response.status >= 500) {
    return "O serviço de clima está temporariamente indisponível. Tente novamente.";
  }

  return `Não foi possível buscar ${resource}. Tente novamente.`;
}

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  country?: string | null;
  country_code?: string | null;
  admin1?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: (GeocodingResult | null)[] | null;
}

function mapGeocodingResult(result: GeocodingResult | null): City | null {
  const latitude = toFiniteNumber(result?.latitude);
  const longitude = toFiniteNumber(result?.longitude);

  if (
    !result?.name?.trim() ||
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  return {
    id: toFiniteOptionalNumber(result.id),
    name: result.name,
    country: result.country ?? undefined,
    countryCode: result.country_code ?? undefined,
    region: result.admin1 ?? undefined,
    latitude,
    longitude,
    timezone: result.timezone ?? undefined,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  if (!name.trim()) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(getHttpErrorMessage(response, "as cidades"));
  }

  const data = await parseJson<GeocodingResponse>(response);

  if (!data || typeof data !== "object") {
    throw new WeatherServiceError(
      "O serviço de cidades retornou dados inválidos. Tente novamente.",
    );
  }

  if (data.results !== undefined && !Array.isArray(data.results)) {
    throw new WeatherServiceError(
      "O serviço de cidades retornou dados inválidos. Tente novamente.",
    );
  }

  return (data.results ?? [])
    .map(mapGeocodingResult)
    .filter((city): city is City => city !== null);
}

interface ForecastCurrent {
  time?: string | null;
  temperature_2m?: number | null;
  weather_code?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
}

interface ForecastDaily {
  time?: (string | null)[] | null;
  weather_code?: (number | null)[] | null;
  temperature_2m_min?: (number | null)[] | null;
  temperature_2m_max?: (number | null)[] | null;
  precipitation_probability_max?: (number | null)[] | null;
}

interface ForecastResponse {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: ForecastCurrent;
  daily?: ForecastDaily;
}

const FORECAST_DAYS = 5;

function mapCurrent(current: ForecastCurrent): CurrentWeather {
  const temperature = toFiniteNumber(current.temperature_2m);
  const weatherCode = toFiniteNumber(current.weather_code);

  return {
    temperatureCelsius: temperature,
    weatherCode,
    condition: getWeatherCondition(weatherCode),
    time: current.time ?? null,
    relativeHumidity: toFiniteNumber(current.relative_humidity_2m),
    windSpeedKmh: toFiniteNumber(current.wind_speed_10m),
    precipitationMm: toFiniteNumber(current.precipitation) ?? 0,
    pressureHpa: toFiniteNumber(current.surface_pressure),
  };
}

function mapDaily(daily: ForecastDaily): ForecastDay[] {
  return (daily.time ?? [])
    .map((date, index) => ({ date, index }))
    .filter((entry): entry is { date: string; index: number } => {
      if (!entry.date) return false;
      return !Number.isNaN(new Date(`${entry.date}T00:00:00`).getTime());
    })
    .slice(0, FORECAST_DAYS)
    .map(({ date, index }) => {
      const weatherCode = toFiniteNumber(daily.weather_code?.[index]);
      const temperatureMin = toFiniteNumber(daily.temperature_2m_min?.[index]);
      const temperatureMax = toFiniteNumber(daily.temperature_2m_max?.[index]);
      const precipitationProbability = toFiniteNumber(
        daily.precipitation_probability_max?.[index],
      );

      return {
        date,
        weatherCode,
        condition: getWeatherCondition(weatherCode),
        temperatureMinCelsius: temperatureMin,
        temperatureMaxCelsius: temperatureMax,
        precipitationProbabilityPercent: precipitationProbability,
      };
    });
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
    throw new WeatherServiceError(getHttpErrorMessage(response, "a previsão"));
  }

  const data = await parseJson<ForecastResponse>(response);

  if (
    !data ||
    typeof data !== "object" ||
    typeof data.current !== "object" ||
    data.current === null ||
    typeof data.daily !== "object" ||
    data.daily === null
  ) {
    throw new WeatherServiceError("Resposta incompleta do serviço de previsão.");
  }

  const forecast = mapDaily(data.daily);

  if (forecast.length < FORECAST_DAYS) {
    throw new WeatherServiceError(
      "A previsão recebida está incompleta. Tente novamente.",
    );
  }

  return {
    city,
    current: mapCurrent(data.current),
    forecast,
    timezone: data.timezone ?? city.timezone ?? "",
    utcOffsetSeconds: data.utc_offset_seconds,
  };
}
