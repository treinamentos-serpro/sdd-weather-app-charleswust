import { useCallback, useRef, useState } from "react";
import { getWeather, searchCities, WeatherServiceError } from "../services/weatherService";
import type { City, WeatherData } from "../types/weather";

export type WeatherStatus = "idle" | "loading" | "success" | "error" | "empty";

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => void;
}

type LastOperation =
  | { type: "search"; name: string }
  | { type: "selectCity"; city: City }
  | null;

const DEFAULT_ERROR_MESSAGE = "Não foi possível completar a operação.";

function toErrorMessage(err: unknown): string {
  return err instanceof WeatherServiceError ? err.message : DEFAULT_ERROR_MESSAGE;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Guarda a última ação para permitir refazê-la em retry().
  const lastOperation = useRef<LastOperation>(null);

  const loadWeather = useCallback(async (city: City) => {
    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus("success");
    } catch (err) {
      setData(null);
      setError(toErrorMessage(err));
      setStatus("error");
    }
  }, []);

  const search = useCallback(
    async (name: string) => {
      lastOperation.current = { type: "search", name };
      setQuery(name);
      setStatus("loading");
      setError(null);

      try {
        const results = await searchCities(name);
        setCities(results);

        if (results.length === 0) {
          setData(null);
          setStatus("empty");
          return;
        }

        await loadWeather(results[0]);
      } catch (err) {
        setCities([]);
        setData(null);
        setError(toErrorMessage(err));
        setStatus("error");
      }
    },
    [loadWeather],
  );

  const selectCity = useCallback(
    async (city: City) => {
      lastOperation.current = { type: "selectCity", city };
      setStatus("loading");
      setError(null);
      await loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(() => {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.type === "search") {
      void search(operation.name);
    } else {
      void selectCity(operation.city);
    }
  }, [search, selectCity]);

  return { status, data, cities, error, query, search, selectCity, retry };
}
