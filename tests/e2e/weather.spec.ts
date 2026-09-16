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

  await page.getByRole("button", { name: "°F" }).click();

  await expect(page.getByText("32,0 °F")).toBeVisible();
});

test("shows a no-results state when geocoding returns an empty payload", async ({ page }) => {
  await page.route("**/v1/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/");
  await page.getByLabel("Nome da cidade").fill("Cidade Inexistente");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Nenhuma cidade encontrada")).toBeVisible();
  await expect(page.getByText("Verifique o nome digitado e tente novamente.")).toBeVisible();
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
