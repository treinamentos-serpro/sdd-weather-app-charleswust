import type { WeatherData } from "../types/weather";

// Dados fictícios de São Paulo para desenvolver a UI sem depender da Open-Meteo.
export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: "São Paulo",
    country: "Brasil",
    countryCode: "BR",
    region: "São Paulo",
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: "America/Sao_Paulo",
  },
  current: {
    temperatureCelsius: 24.3,
    weatherCode: 2,
    condition: "Parcialmente nublado",
    time: "2026-09-16T14:00",
    relativeHumidity: 62,
    windSpeedKmh: 14.5,
    precipitationMm: 0,
    pressureHpa: 1015,
  },
  forecast: [
    {
      date: "2026-09-16",
      weatherCode: 2,
      condition: "Parcialmente nublado",
      temperatureMinCelsius: 17.2,
      temperatureMaxCelsius: 26.8,
      precipitationProbabilityPercent: 10,
    },
    {
      date: "2026-09-17",
      weatherCode: 61,
      condition: "Chuva fraca",
      temperatureMinCelsius: 16.5,
      temperatureMaxCelsius: 22.4,
      precipitationProbabilityPercent: 70,
    },
    {
      date: "2026-09-18",
      weatherCode: 3,
      condition: "Nublado",
      temperatureMinCelsius: 15.9,
      temperatureMaxCelsius: 21.7,
      precipitationProbabilityPercent: 30,
    },
    {
      date: "2026-09-19",
      weatherCode: 0,
      condition: "Céu limpo",
      temperatureMinCelsius: 14.1,
      temperatureMaxCelsius: 25.3,
      precipitationProbabilityPercent: 0,
    },
    {
      date: "2026-09-20",
      weatherCode: 1,
      condition: "Predominantemente limpo",
      temperatureMinCelsius: 16.0,
      temperatureMaxCelsius: 27.6,
      precipitationProbabilityPercent: 5,
    },
  ],
  timezone: "America/Sao_Paulo",
  utcOffsetSeconds: -10800,
};
