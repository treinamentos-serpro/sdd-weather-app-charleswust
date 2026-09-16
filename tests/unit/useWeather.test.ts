import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWeather } from "../../src/hooks/useWeather";
import type { City, WeatherData } from "../../src/types/weather";

vi.mock("../../src/services/weatherService", () => {
  class WeatherServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "WeatherServiceError";
    }
  }
  return {
    searchCities: vi.fn(),
    getWeather: vi.fn(),
    WeatherServiceError,
  };
});

import { getWeather, searchCities, WeatherServiceError } from "../../src/services/weatherService";

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

const SAMPLE_CITY: City = {
  id: 1,
  name: "Seattle",
  latitude: 47.6062,
  longitude: -122.3321,
};

const SAMPLE_WEATHER: WeatherData = {
  city: SAMPLE_CITY,
  current: {
    temperatureCelsius: 18,
    weatherCode: 0,
    condition: "Céu limpo",
    time: "2026-09-16T12:00",
  },
  forecast: [],
  timezone: "America/Los_Angeles",
};

describe("useWeather", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("busca cidades e carrega o clima da primeira quando há resultado", async () => {
    searchCitiesMock.mockResolvedValue([SAMPLE_CITY]);
    getWeatherMock.mockResolvedValue(SAMPLE_WEATHER);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Seattle");
    });

    expect(searchCitiesMock).toHaveBeenCalledWith("Seattle");
    expect(getWeatherMock).toHaveBeenCalledWith(SAMPLE_CITY);
    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(SAMPLE_WEATHER);
    expect(result.current.cities).toEqual([SAMPLE_CITY]);
    expect(result.current.query).toBe("Seattle");
  });

  it("define status 'empty' quando a busca não encontra cidades", async () => {
    searchCitiesMock.mockResolvedValue([]);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Cidade Inexistente");
    });

    expect(result.current.status).toBe("empty");
    expect(result.current.data).toBeNull();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it("define status 'error' quando searchCities falha", async () => {
    searchCitiesMock.mockRejectedValue(
      new WeatherServiceError("Falha de rede."),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Seattle");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Falha de rede.");
  });

  it("selectCity carrega o clima da cidade selecionada", async () => {
    getWeatherMock.mockResolvedValue(SAMPLE_WEATHER);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(SAMPLE_CITY);
    });

    expect(getWeatherMock).toHaveBeenCalledWith(SAMPLE_CITY);
    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(SAMPLE_WEATHER);
  });

  it("retry refaz a última busca por nome", async () => {
    searchCitiesMock.mockRejectedValueOnce(
      new WeatherServiceError("Falha de rede."),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search("Seattle");
    });

    expect(result.current.status).toBe("error");

    searchCitiesMock.mockResolvedValueOnce([SAMPLE_CITY]);
    getWeatherMock.mockResolvedValueOnce(SAMPLE_WEATHER);

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(searchCitiesMock).toHaveBeenLastCalledWith("Seattle");
  });

  it("retry refaz a última seleção de cidade", async () => {
    getWeatherMock.mockRejectedValueOnce(
      new WeatherServiceError("Falha de rede."),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(SAMPLE_CITY);
    });

    expect(result.current.status).toBe("error");

    getWeatherMock.mockResolvedValueOnce(SAMPLE_WEATHER);

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(getWeatherMock).toHaveBeenLastCalledWith(SAMPLE_CITY);
  });
});
