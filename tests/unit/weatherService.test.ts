import { afterEach, describe, expect, it, vi } from "vitest";
import { getWeather, searchCities, WeatherServiceError } from "../../src/services/weatherService";
import type { City } from "../../src/types/weather";

describe("searchCities", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna [] para input vazio sem chamar a rede", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchCities("   ");

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mapeia os resultados da API para City[]", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: "Seattle",
            country: "United States",
            country_code: "US",
            admin1: "Washington",
            latitude: 47.6062,
            longitude: -122.3321,
            timezone: "America/Los_Angeles",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchCities("Seattle");

    expect(result).toEqual([
      {
        id: 1,
        name: "Seattle",
        country: "United States",
        countryCode: "US",
        region: "Washington",
        latitude: 47.6062,
        longitude: -122.3321,
        timezone: "America/Los_Angeles",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("name=Seattle"),
      expect.anything(),
    );
  });

  it("retorna [] quando a API não tem resultados", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchCities("Cidade Inexistente");

    expect(result).toEqual([]);
  });

  it("ignora cidades com nome ou coordenadas ausentes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 1, name: null, latitude: 1, longitude: 2 },
          { id: 2, name: "Cidade válida", latitude: 0, longitude: 0 },
          { id: 3, name: "Sem coordenadas", latitude: null, longitude: 2 },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Cidade")).resolves.toEqual([
      expect.objectContaining({ name: "Cidade válida", latitude: 0, longitude: 0 }),
    ]);
  });

  it("lança WeatherServiceError em resposta não-ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Seattle")).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });

  it("converte AbortError em WeatherServiceError de timeout", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Seattle")).rejects.toThrow(
      "A conexão demorou mais de 10 segundos. Tente novamente.",
    );
  });

  it("converte falha de rede em WeatherServiceError", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Seattle")).rejects.toThrow(
      "Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.",
    );
  });

  it("aborta uma requisição que excede o timeout", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, options?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = searchCities("Seattle");
    const assertion = expect(request).rejects.toThrow(
      "A conexão demorou mais de 10 segundos. Tente novamente.",
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await assertion;
    vi.useRealTimers();
  });

  it("usa encodeURIComponent no nome da cidade", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchCities("São Paulo & Cia");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("São Paulo & Cia")),
      expect.anything(),
    );
  });
});

const SAMPLE_CITY: City = {
  id: 1,
  name: "Seattle",
  latitude: 47.6062,
  longitude: -122.3321,
  timezone: "America/Los_Angeles",
};

describe("getWeather", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mapeia current e daily (5 dias) para WeatherData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: "America/Los_Angeles",
        utc_offset_seconds: -25200,
        current: {
          time: "2026-09-16T14:00",
          temperature_2m: 18.5,
          weather_code: 2,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1012,
        },
        daily: {
          time: [
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
            "2026-09-21",
          ],
          weather_code: [2, 3, 61, 0, 1, 3],
          temperature_2m_min: [12, 11, 10, 9, 13, 12],
          temperature_2m_max: [20, 19, 18, 21, 22, 20],
          precipitation_probability_max: [10, 20, 80, 0, 5, 15],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getWeather(SAMPLE_CITY);

    expect(result.current.temperatureCelsius).toBe(18.5);
    expect(result.current.condition).toBe("Parcialmente nublado");
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      date: "2026-09-16",
      weatherCode: 2,
      condition: "Parcialmente nublado",
      temperatureMinCelsius: 12,
      temperatureMaxCelsius: 20,
      precipitationProbabilityPercent: 10,
    });
  });

  it("normaliza precipitation null para 0", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          time: "2026-09-16T14:00",
          temperature_2m: 18.5,
          weather_code: 2,
          precipitation: null,
        },
        daily: {
          time: ["2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"],
          weather_code: [2, 3, 61, 0, 1],
          temperature_2m_min: [12, 11, 10, 9, 13],
          temperature_2m_max: [20, 19, 18, 21, 22],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getWeather(SAMPLE_CITY);

    expect(result.current.precipitationMm).toBe(0);
  });

  it("normaliza campos atuais e diários ausentes para fallbacks seguros", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {},
        daily: {
          time: [
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-19",
            "2026-09-20",
          ],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getWeather(SAMPLE_CITY);

    expect(result.current).toEqual({
      temperatureCelsius: null,
      weatherCode: null,
      condition: null,
      time: null,
      relativeHumidity: null,
      windSpeedKmh: null,
      precipitationMm: 0,
      pressureHpa: null,
    });
    expect(result.forecast).toHaveLength(5);
  });

  it("rejeita uma previsão com menos de cinco datas válidas", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {},
        daily: {
          time: ["2026-09-16", null, "data-invalida"],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeather(SAMPLE_CITY)).rejects.toThrow(
      "A previsão recebida está incompleta. Tente novamente.",
    );
  });

  it("lança WeatherServiceError quando current está ausente", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-09-16"],
          weather_code: [2],
          temperature_2m_min: [12],
          temperature_2m_max: [20],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeather(SAMPLE_CITY)).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });

  it("lança WeatherServiceError quando daily está ausente", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          time: "2026-09-16T14:00",
          temperature_2m: 18.5,
          weather_code: 2,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeather(SAMPLE_CITY)).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });

  it("lança WeatherServiceError em resposta não-ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeather(SAMPLE_CITY)).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });
});
