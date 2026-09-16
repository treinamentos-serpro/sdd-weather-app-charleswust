// Contratos compartilhados do domínio de clima, sem dependências de React ou rede.

export type Unit = "celsius" | "fahrenheit";

export interface City {
  id?: number;
  name: string;
  country?: string;
  countryCode?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureCelsius: number | null;
  weatherCode: number | null;
  condition: string | null;
  time: string | null;
  relativeHumidity?: number | null;
  windSpeedKmh?: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  condition: string | null;
  temperatureMinCelsius: number | null;
  temperatureMaxCelsius: number | null;
  precipitationProbabilityPercent?: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string;
  utcOffsetSeconds?: number;
}
