import { expect, test } from "@playwright/test";

const CITY = {
  id: 1,
  name: "Seattle",
  country: "United States",
  country_code: "US",
  admin1: "Washington",
  latitude: 47.6062,
  longitude: -122.3321,
  timezone: "America/Los_Angeles",
};

const FORECAST_RESPONSE = {
  timezone: "America/Los_Angeles",
  utc_offset_seconds: -25200,
  current: {
    time: "2026-09-16T12:00",
    temperature_2m: 0,
    weather_code: 0,
    relative_humidity_2m: 50,
    wind_speed_10m: 9,
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
    ],
    weather_code: [0, 1, 2, 3, 0],
    temperature_2m_min: [18, 17, 16, 15, 18],
    temperature_2m_max: [24, 26, 27, 25, 23],
    precipitation_probability_max: [10, 20, 30, 40, 25],
  },
};

test("searches a city, shows the forecast, and converts to Fahrenheit", async ({ page }) => {
  await page.route("**/v1/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [CITY] }),
    });
  });

  await page.route("**/v1/forecast**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FORECAST_RESPONSE),
    });
  });

  await page.goto("/");

  await page.getByLabel("Nome da cidade").fill("Seattle");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Seattle")).toBeVisible();
  await expect(page.getByLabel("Previsão de cinco dias")).toBeVisible();
  await expect(page.getByText("0,0 °C")).toBeVisible();
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");

  await page.getByRole("button", { name: "°F" }).click();

  await expect(page.getByText("32,0 °F")).toBeVisible();
});

test("shows a no-results state when geocoding returns an empty payload", async ({ page }) => {
  let forecastRequests = 0;

  await page.route("**/v1/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
  await page.route("**/v1/forecast**", async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto("/");
  await page.getByLabel("Nome da cidade").fill("Cidade Inexistente");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Nenhuma cidade encontrada")).toBeVisible();
  await expect(page.getByText("Verifique o nome digitado e tente novamente.")).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test("does not search empty or whitespace-only queries", async ({ page }) => {
  let searchRequests = 0;
  await page.route("**/v1/search**", async (route) => {
    searchRequests += 1;
    await route.abort();
  });

  await page.goto("/");
  const input = page.getByLabel("Nome da cidade");
  const searchButton = page.getByRole("button", { name: "Buscar" });

  await searchButton.click();
  await input.fill("   ");
  await searchButton.click();

  expect(searchRequests).toBe(0);
  await expect(page.getByText("Comece uma busca")).toBeVisible();
});

test("encodes special characters in the city search", async ({ page }) => {
  const query = "São Paulo & Cia";
  let searchUrl = "";

  await page.route("**/v1/search**", async (route) => {
    searchUrl = route.request().url();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [CITY] }),
    });
  });
  await page.route("**/v1/forecast**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FORECAST_RESPONSE),
    });
  });

  await page.goto("/");
  await page.getByLabel("Nome da cidade").fill(query);
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Seattle")).toBeVisible();
  expect(searchUrl).toContain(encodeURIComponent(query));
});

test("shows a recoverable error for an incomplete forecast", async ({ page }) => {
  await page.route("**/v1/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [CITY] }),
    });
  });
  await page.route("**/v1/forecast**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        current: FORECAST_RESPONSE.current,
        daily: {
          time: FORECAST_RESPONSE.daily.time.slice(0, 4),
          weather_code: FORECAST_RESPONSE.daily.weather_code.slice(0, 4),
          temperature_2m_min: FORECAST_RESPONSE.daily.temperature_2m_min.slice(0, 4),
          temperature_2m_max: FORECAST_RESPONSE.daily.temperature_2m_max.slice(0, 4),
        },
      }),
    });
  });

  await page.goto("/");
  await page.getByLabel("Nome da cidade").fill("Seattle");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "A previsão recebida está incompleta",
  );
  await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
});

test("works correctly on mobile when searching for a city", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route("**/v1/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [CITY] }),
    });
  });

  await page.route("**/v1/forecast**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FORECAST_RESPONSE),
    });
  });

  await page.goto("/");
  await page.getByLabel("Nome da cidade").fill("Seattle");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Seattle")).toBeVisible();
  await expect(page.getByText("0,0 °C")).toBeVisible();
  await expect(page.getByLabel("Previsão de cinco dias")).toBeVisible();
});
